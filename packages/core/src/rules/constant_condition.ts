import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ExpressionNode, TokenNode} from "../abap/nodes";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {CGenericType, CharacterType, StringType, StructureType} from "../abap/types/basic";
import {Identifier} from "../abap/4_file_information/_identifier";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IFoldCandidate, IOccurrence, ObjectAnalysis, OccurrenceKind, PredicateKind, Procedure, Variable,
  characterConstant, deleteStatement, foldIf, foldIssues, initialDeclaration, isImmutable, mergeEdits, plainClear,
  plainMove, sameCharacters, simplePredicate, textLiteral} from "./_procedure_analysis";

export class ConstantConditionConf extends BasicRuleConfig {
  /** Report x <> a OR x <> b, always true, and x = a AND x = b, always false, for different character values a and b */
  public exclusiveValues: boolean = true;
}

interface IValueComparison {
  /** the compared data object, names in upper case */
  readonly subject: string;
  readonly value: string;
  /** = or EQ, or NOT with <> or NE */
  readonly equal: boolean;
  readonly compare: ExpressionNode;
  readonly constant: ExpressionNode;
}

export class ConstantCondition implements IRule {
  private reg: IRegistry;
  private conf = new ConstantConditionConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "constant_condition",
      title: "Constant condition",
      shortDescription: `Finds IF and ELSEIF conditions on local variables whose value is known, and conditions that compare
a field with two different values and are always true or always false`,
      extendedInformation: `Reports two cases, for local variables of a METHOD, FORM or FUNCTION.

1. DATA(c) = <constant>. where the constant is a character literal like 'X', or a character constant like
abap_true, abap_false or space, and the only other reference to c is the condition of an IF or ELSEIF:
c = <constant>, c <> <constant>, EQ, NE, c IS INITIAL, c IS NOT INITIAL, optionally with NOT.
The declaration must be executed before the condition on every path: the IF is in the block of the
declaration or a nested block. The quick fix deletes the declaration.

2. DATA v TYPE ... without VALUE, or DATA(v) = VALUE t( ). with an explicit type and nothing in the parentheses,
where v is never changed, except by CLEAR v., and its address is never taken, in a condition v IS [NOT] INITIAL
or v IS [NOT] BOUND. The declaration is kept.

The quick fix removes the IF branch that is never taken, or keeps the branch that is always taken and
removes the rest, also in ELSEIF chains: a first IF branch that is never taken turns the next ELSEIF into IF,
an ELSEIF branch that is always taken turns into ELSE. Nothing is reported if a removed branch declares
data that is used outside of it.

Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL. No release requirement.

Option exclusiveValues: reports x <> a OR x <> b, which is always true, and x = a AND x = b, which is always
false, in any condition of a METHOD, FORM or FUNCTION, also with dynamic code. Also with NE and EQ, with NOT,
with the operands swapped, and with more conditions joined by the same operator. x is a data object of type c,
generic c or string, without calls, offsets or table expressions. a and b are character literals or character
constants, also components of constant structures of a class or interface, with different values. Usually one
of the operators or one of the values is wrong, there is no quick fix.
Not reported: conditions that mix AND and OR or contain a call, values that are not known, like constants of
classes outside the registry, other types of x, which can convert different values to the same one, ASSERT,
and SQL conditions, where a NULL value makes both comparisons unknown.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA(lv_active) = abap_true.
IF lv_active = abap_true.
  run( ).
ELSE.
  skip( ).
ENDIF.
IF lv_kind <> 'N' OR lv_kind <> 'P'.
  skip( ).
ENDIF.`,
      goodExample: `run( ).
IF lv_kind <> 'N' AND lv_kind <> 'P'.
  skip( ).
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ConstantConditionConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    const analysis = ObjectAnalysis.run(this.reg, obj);
    if (analysis === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    for (const procedure of analysis.procedures) {
      if (this.conf.exclusiveValues) {
        issues.push(...this.exclusiveValues(procedure));
      }
      if (procedure.supported === false) {
        continue;
      }
      const candidates: IFoldCandidate[] = [];
      for (const variable of procedure.locals()) {
        if (initialDeclaration(variable) !== undefined) {
          this.initialVariable(procedure, variable, candidates);
        } else if (variable.inline) {
          this.constantVariable(procedure, variable, candidates);
        }
      }
      issues.push(...foldIssues(procedure.file, candidates, this.getMetadata().key, this.conf.severity));
    }
    return issues;
  }

  /** DATA(c) = abap_true. IF c = abap_true. */
  private constantVariable(procedure: Procedure, variable: Variable, candidates: IFoldCandidate[]) {
    const declaration = variable.declaration!;
    const move = plainMove(declaration);
    const read = variable.occurrences[0];
    if (move === undefined || move.operator !== "="
        || move.target.getChildren().length !== 1
        || move.target.findDirectExpression(Expressions.InlineData) === undefined
        || !(variable.identifier.getType() instanceof CharacterType)
        || variable.occurrences.length !== 1 || read.kind !== OccurrenceKind.Read
        || !procedure.dominates(declaration, read.statement)) {
      return;
    }
    const value = characterConstant(procedure, move.source);
    const result = value === undefined ? undefined : this.evaluate(procedure, read, value);
    if (result === undefined) {
      return;
    }
    const structure = procedure.ifStructure(read.statement);
    const fold = structure === undefined ? undefined : foldIf(procedure, structure, read.statement, result);
    if (structure === undefined || fold === undefined) {
      return;
    }
    candidates.push({
      structure,
      statement: read.statement,
      message: "Condition is always " + (result ? "true" : "false") + ", " + variable.identifier.getName() + " is constant",
      fix: mergeEdits(procedure.file, [fold, deleteStatement(procedure.file, declaration)]),
    });
  }

  /** DATA v TYPE ... or DATA(v) = VALUE t( ). never changed: IF v IS INITIAL / IS BOUND */
  private initialVariable(procedure: Procedure, variable: Variable, candidates: IFoldCandidate[]) {
    if (variable.escapes()
        || variable.writes().some(w => plainClear(w.statement)?.getStart().equals(w.token.getStart()) !== true)) {
      return;
    }
    for (const read of variable.reads()) {
      const predicate = simplePredicate(read.statement);
      if (predicate === undefined || !this.isOperand(predicate.left, read)
          || (predicate.kind !== PredicateKind.Initial && predicate.kind !== PredicateKind.Bound)) {
        continue;
      }
      // initial: IS INITIAL is true, IS BOUND is false
      const result = (predicate.kind === PredicateKind.Initial) !== predicate.negated;
      const structure = procedure.ifStructure(read.statement);
      const fix = structure === undefined ? undefined : foldIf(procedure, structure, read.statement, result);
      if (structure === undefined || fix === undefined) {
        continue;
      }
      candidates.push({
        structure,
        statement: read.statement,
        message: "Condition is always " + (result ? "true" : "false") + ", " + variable.identifier.getName() + " is never changed",
        fix,
      });
    }
  }

  private evaluate(procedure: Procedure, read: IOccurrence, value: string): boolean | undefined {
    const predicate = simplePredicate(read.statement);
    if (predicate === undefined) {
      return undefined;
    }
    if (predicate.kind === PredicateKind.Initial && this.isOperand(predicate.left, read)) {
      return sameCharacters(value, "") !== predicate.negated;
    } else if (predicate.kind === PredicateKind.Equal) {
      let other = predicate.right!;
      if (!this.isOperand(predicate.left, read)) {
        if (!this.isOperand(predicate.right!, read)) {
          return undefined;
        }
        other = predicate.left;
      }
      const compared = characterConstant(procedure, other);
      if (compared === undefined) {
        return undefined;
      }
      return sameCharacters(value, compared) !== predicate.negated;
    }
    return undefined;
  }

  private isOperand(source: ExpressionNode, read: IOccurrence): boolean {
    return source.countTokens() === 1 && source.findDirectExpression(Expressions.FieldChain) !== undefined
      && source.getFirstToken().getStart().equals(read.token.getStart());
  }

  /** x <> a OR x <> b, x = a AND x = b */
  private exclusiveValues(procedure: Procedure): Issue[] {
    const issues: Issue[] = [];
    for (const statement of procedure.statements) {
      if (statement.get() instanceof Statements.Assert) {
        continue;
      }
      for (const cond of statement.findAllExpressionsRecursive(Expressions.Cond)) {
        const operators = cond.getChildren().filter(c => c instanceof TokenNode).map(c => c.getFirstToken().getStr().toUpperCase());
        const operator = operators[0];
        if ((operator !== "OR" && operator !== "AND") || operators.some(o => o !== operator) || this.hasCall(cond)) {
          continue;
        }
        const seen: IValueComparison[] = [];
        for (const child of cond.getChildren()) {
          const comparison = child instanceof ExpressionNode && child.get() instanceof Expressions.Compare
            ? this.valueComparison(procedure, child) : undefined;
          if (comparison === undefined || comparison.equal !== (operator === "AND")) {
            continue;
          }
          const other = seen.find(s => s.subject === comparison.subject && !sameCharacters(s.value, comparison.value));
          if (other !== undefined) {
            const message = "Condition is always " + (operator === "OR" ? "true" : "false") + ", "
              + this.subjectText(comparison) + " cannot be both "
              + other.constant.concatTokens() + " and " + comparison.constant.concatTokens();
            issues.push(Issue.atRange(procedure.file, other.compare.getFirstToken().getStart(),
                                      comparison.compare.getLastToken().getEnd(), message, this.getMetadata().key, this.conf.severity));
            break;
          }
          seen.push(comparison);
        }
      }
    }
    return issues;
  }

  private hasCall(node: ExpressionNode): boolean {
    return node.findFirstExpression(Expressions.MethodCall) !== undefined
      || node.findFirstExpression(Expressions.MethodCallChain) !== undefined
      || node.findFirstExpression(Expressions.NewObject) !== undefined;
  }

  /** x = a, x <> a, a = x, NOT x = a etc, x character-like and a a known character value */
  private valueComparison(procedure: Procedure, compare: ExpressionNode): IValueComparison | undefined {
    const children = compare.getChildren();
    const negated = children[0] instanceof TokenNode && children[0].getFirstToken().getStr().toUpperCase() === "NOT";
    const rest = children.slice(negated ? 1 : 0);
    if (rest.length !== 3 || !(rest[0] instanceof ExpressionNode) || !(rest[2] instanceof ExpressionNode)
        || !(rest[1].get() instanceof Expressions.CompareOperator)) {
      return undefined;
    }
    const operator = rest[1].concatTokens().toUpperCase().replace(/ /g, "");
    let equal: boolean;
    if (operator === "=" || operator === "EQ") {
      equal = true;
    } else if (operator === "<>" || operator === "><" || operator === "NE") {
      equal = false;
    } else {
      return undefined;
    }
    for (const [subject, constant] of [[rest[0], rest[2]], [rest[2], rest[0]]]) {
      const value = this.constantValue(procedure, constant);
      const type = value === undefined ? undefined : this.subjectType(procedure, subject);
      if (value !== undefined
          && (type instanceof CharacterType || type instanceof CGenericType || type instanceof StringType)) {
        const text = subject.getTokens().map(t => t.getStr().toUpperCase()).join(" ");
        return {subject: text, value, equal: equal !== negated, compare, constant};
      }
    }
    return undefined;
  }

  private subjectText(comparison: IValueComparison): string {
    return comparison.compare.getChildren().find(c => c instanceof ExpressionNode && c !== comparison.constant
      && c.get() instanceof Expressions.Source)?.concatTokens() ?? comparison.subject;
  }

  /** type of a field, field symbol, attribute or component chain, without calls, offsets or table expressions */
  private subjectType(procedure: Procedure, source: ExpressionNode): AbstractType | undefined {
    const chain = source.getChildren().length === 1 ? source.findDirectExpression(Expressions.FieldChain) : undefined;
    const children = chain?.getChildren() ?? [];
    let identifier: Identifier | undefined;
    let next: number;
    if (children[0] instanceof ExpressionNode
        && (children[0].get() instanceof Expressions.SourceField || children[0].get() instanceof Expressions.SourceFieldSymbol)) {
      identifier = procedure.identifierAt(children[0].getFirstToken());
      next = 1;
    } else if (children[0] instanceof ExpressionNode && children[0].get() instanceof Expressions.ClassName
        && children[1]?.getFirstToken().getStr() === "=>" && children[2] instanceof ExpressionNode) {
      identifier = procedure.identifierAt(children[2].getFirstToken());
      next = 3;
    } else {
      return undefined;
    }
    let type = identifier instanceof TypedIdentifier ? identifier.getType() : undefined;
    for (let i = next; i < children.length; i += 2) {
      const separator = children[i];
      const name = children[i + 1];
      if (!(separator instanceof TokenNode) || !(name instanceof ExpressionNode) || type === undefined) {
        return undefined;
      } else if (separator.getFirstToken().getStr() === "->" && name.get() instanceof Expressions.AttributeName) {
        const attribute = procedure.identifierAt(name.getFirstToken());
        type = attribute instanceof TypedIdentifier ? attribute.getType() : undefined;
      } else if (separator.getFirstToken().getStr() === "-" && name.get() instanceof Expressions.ComponentName
          && type instanceof StructureType) {
        type = type.getComponentByName(name.getFirstToken().getStr());
      } else {
        return undefined;
      }
    }
    return type;
  }

  /** value of a character literal, a character constant or a character component of a constant structure */
  private constantValue(procedure: Procedure, source: ExpressionNode): string | undefined {
    if (source.findDirectExpression(Expressions.Constant) !== undefined) {
      return characterConstant(procedure, source);
    }
    const chain = source.getChildren().length === 1 ? source.findDirectExpression(Expressions.FieldChain) : undefined;
    const children = chain?.getChildren() ?? [];
    let identifier: Identifier | undefined;
    let next: number;
    if (children[0] instanceof ExpressionNode && children[0].get() instanceof Expressions.SourceField) {
      identifier = procedure.identifierAt(children[0].getFirstToken());
      next = 1;
    } else if (children[0] instanceof ExpressionNode && children[0].get() instanceof Expressions.ClassName
        && children[1]?.getFirstToken().getStr() === "=>" && children[2] instanceof ExpressionNode
        && children[2].get() instanceof Expressions.AttributeName) {
      identifier = procedure.identifierAt(children[2].getFirstToken());
      next = 3;
    } else {
      return undefined;
    }
    if (!(identifier instanceof TypedIdentifier) || !isImmutable(identifier)) {
      return undefined;
    }
    let type: AbstractType | undefined = identifier.getType();
    let value = identifier.getValue();
    if (children.length === next + 2) {
      const name = children[next + 1];
      if (children[next].getFirstToken().getStr() !== "-" || !(name instanceof ExpressionNode)
          || !(name.get() instanceof Expressions.ComponentName) || !(type instanceof StructureType)
          || typeof value !== "object") {
        return undefined;
      }
      const component = name.getFirstToken().getStr().toLowerCase();
      type = type.getComponentByName(component);
      const key = Object.keys(value).find(k => k.toLowerCase() === component);
      value = key === undefined ? undefined : value[key];
    } else if (children.length !== next) {
      return undefined;
    }
    const text = typeof value === "string" ? textLiteral(value) : undefined;
    if (!(type instanceof CharacterType) || text === undefined) {
      return undefined;
    }
    // the value is cut to the length of the constant
    return text.substring(0, type.getLength());
  }

}
