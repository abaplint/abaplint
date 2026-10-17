import * as Expressions from "../abap/2_statements/expressions";
import {ExpressionNode} from "../abap/nodes";
import {CharacterType} from "../abap/types/basic";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IFoldCandidate, IOccurrence, ObjectAnalysis, OccurrenceKind, PredicateKind, Procedure, Variable,
  characterConstant, deleteStatement, foldIf, foldIssues, mergeEdits, plainClear, plainData, plainMove,
  sameCharacters, simplePredicate} from "./_procedure_analysis";

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
      tags: [RuleTag.Quickfix],
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
      const candidates: IFoldCandidate[] = [];
      for (const variable of procedure.locals()) {
        if (variable.inline) {
          this.constantVariable(procedure, variable, candidates);
        } else {
          this.initialVariable(procedure, variable, candidates);
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

  /** DATA v TYPE ... never changed: IF v IS INITIAL / IS BOUND */
  private initialVariable(procedure: Procedure, variable: Variable, candidates: IFoldCandidate[]) {
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

}
