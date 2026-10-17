import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ExpressionNode, StatementNode} from "../abap/nodes";
import {CharacterType} from "../abap/types/basic";
import {IEdit} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IOccurrence, ObjectAnalysis, OccurrenceKind, PredicateKind, Procedure, Variable, characterConstant,
  deleteStatement, foldIf, mergeEdits, plainClear, plainData, plainMove, sameCharacters,
  simplePredicate} from "./_procedure_analysis";

export class ConstantConditionConf extends BasicRuleConfig {
}

export class ConstantCondition implements IRule {
  private reg: IRegistry;
  private conf = new ConstantConditionConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "constant_condition",
      title: "Constant condition",
      shortDescription: `Finds IF and ELSEIF conditions on local variables whose value is known`,
      extendedInformation: `Reports two cases, for local variables of a METHOD, FORM or FUNCTION.

1. DATA(c) = <constant>. where the constant is a character literal like 'X', or a character constant like
abap_true, abap_false or space, and the only other reference to c is the condition of an IF or ELSEIF:
c = <constant>, c <> <constant>, EQ, NE, c IS INITIAL, c IS NOT INITIAL, optionally with NOT.
The declaration must be executed before the condition on every path: the IF is in the block of the
declaration or a nested block. The quick fix deletes the declaration.

2. DATA v TYPE ... without VALUE, where v is never changed, except by CLEAR v., and its address is never taken,
in a condition v IS [NOT] INITIAL or v IS [NOT] BOUND. The declaration is kept.

The quick fix removes the IF branch that is never taken, or keeps the branch that is always taken and
removes the rest, also in ELSEIF chains: a first IF branch that is never taken turns the next ELSEIF into IF,
an ELSEIF branch that is always taken turns into ELSE. Nothing is reported if a removed branch declares
data that is used outside of it.

Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL. No release requirement.`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `DATA(lv_active) = abap_true.
IF lv_active = abap_true.
  run( ).
ELSE.
  skip( ).
ENDIF.`,
      goodExample: `run( ).`,
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
      if (procedure.supported === false) {
        continue;
      }
      for (const variable of procedure.locals()) {
        if (variable.inline) {
          this.constantVariable(procedure, variable, issues);
        } else {
          this.initialVariable(procedure, variable, issues);
        }
      }
    }
    return issues;
  }

  /** DATA(c) = abap_true. IF c = abap_true. */
  private constantVariable(procedure: Procedure, variable: Variable, issues: Issue[]) {
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
    const fold = this.fold(procedure, read.statement, result);
    if (fold === undefined) {
      return;
    }
    const fix = mergeEdits(procedure.file, [fold, deleteStatement(procedure.file, declaration)]);
    issues.push(Issue.atStatement(procedure.file, read.statement,
                                  "Condition is always " + (result ? "true" : "false") + ", "
                                  + variable.identifier.getName() + " is constant",
                                  this.getMetadata().key, this.conf.severity, fix));
  }

  /** DATA v TYPE ... never changed: IF v IS INITIAL / IS BOUND */
  private initialVariable(procedure: Procedure, variable: Variable, issues: Issue[]) {
    if (!plainData(variable.declaration!) || variable.escapes()
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
      const fix = this.fold(procedure, read.statement, result);
      if (fix === undefined) {
        continue;
      }
      issues.push(Issue.atStatement(procedure.file, read.statement,
                                    "Condition is always " + (result ? "true" : "false") + ", "
                                    + variable.identifier.getName() + " is never changed",
                                    this.getMetadata().key, this.conf.severity, fix));
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

  private fold(procedure: Procedure, statement: StatementNode, value: boolean): IEdit | undefined {
    const structure = procedure.ifStructure(statement);
    if (structure === undefined || !(statement.get() instanceof Statements.If || statement.get() instanceof Statements.ElseIf)) {
      return undefined;
    }
    return foldIf(procedure, structure, statement, value);
  }
}
