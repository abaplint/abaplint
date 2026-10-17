import * as Expressions from "../abap/2_statements/expressions";
import {EditHelper} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, OccurrenceKind, SourceKind, dataSource, deleteStatement, isCondition, mergeEdits,
  plainMove, unchangedBetween} from "./_procedure_analysis";

export class UnnecessaryCopyConf extends BasicRuleConfig {
}

export class UnnecessaryCopy implements IRule {
  private reg: IRegistry;
  private conf = new UnnecessaryCopyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_copy",
      title: "Unnecessary copy",
      shortDescription: `Finds DATA(a) = b. where a is read exactly once, and b can be read instead`,
      extendedInformation: `Reports DATA(a) = b. when all of the following hold:

* a is a local variable of a METHOD, FORM or FUNCTION, and has exactly one more reference: a read,
  which does not take its address, bind a field symbol to it, or pass it to USING, CHANGING or EXPORTING
* b is a plain data object: variable, constant, attribute, or a chain of components and attributes,
  without calls, offsets, table expressions, field symbols or ->*
* the declaration is executed before the read on every path: the read is in the block of the declaration
  or a nested block, and both are in the same loop
* b keeps its value from the declaration until the read: for a local b, no write to it and its address is
  never taken; for other b, in addition no method, function or form call and no write except to local
  variables, by value parameters and RETURNING in between

a has the type of b, so reading b instead does not change any conversion.
A constant b read in IF, ELSEIF, WHILE, CHECK, CASE or WHEN is not reported, see constant_condition.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the declaration and replaces the read of a with b. No release requirement,
inline declarations need 7.40 SP02 already.

See also alias_never_reassigned for copies that are read several times.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA(lv_name) = iv_name.
rv_text = |Hello { lv_name }|.`,
      goodExample: `rv_text = |Hello { iv_name }|.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnnecessaryCopyConf) {
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
        const declaration = variable.declaration!;
        const move = variable.inline ? plainMove(declaration) : undefined;
        const read = variable.occurrences[0];
        if (move === undefined || move.operator !== "="
            || move.target.getChildren().length !== 1
            || move.target.findDirectExpression(Expressions.InlineData) === undefined
            || variable.occurrences.length !== 1 || read.kind !== OccurrenceKind.Read
            || variable.identifier.getType().isGeneric()
            || !procedure.dominates(declaration, read.statement)
            || !procedure.sameLoop(declaration, read.statement)) {
          continue;
        }
        const source = dataSource(procedure, move.source);
        if (source === undefined || source.base === variable
            || (source.kind === SourceKind.Immutable && isCondition(read.statement))
            || !unchangedBetween(procedure, source, declaration, read.statement, read.token)) {
          continue;
        }
        const fix = mergeEdits(procedure.file, [
          EditHelper.replaceToken(procedure.file, read.token, source.text),
          deleteStatement(procedure.file, declaration)]);
        const message = "Unnecessary copy " + variable.identifier.getName() + ", read " + source.text + " instead";
        issues.push(Issue.atStatement(procedure.file, declaration, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }
}
