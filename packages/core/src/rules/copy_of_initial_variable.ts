import * as Expressions from "../abap/2_statements/expressions";
import {EditHelper, IEdit} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, deleteStatement, identicalTypes, isReferenceType, mergeEdits, nodeText, plainClear,
  plainData, plainMove, singleField, targetType} from "./_procedure_analysis";

export class CopyOfInitialVariableConf extends BasicRuleConfig {
}

export class CopyOfInitialVariable implements IRule {
  private reg: IRegistry;
  private conf = new CopyOfInitialVariableConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "copy_of_initial_variable",
      title: "Copy of initial variable",
      shortDescription: `Finds assignments from a local variable that is always initial`,
      extendedInformation: `Reports DATA v TYPE ... [CLEAR v.] x = v. when all of the following hold:

* v is a local variable of a METHOD, FORM or FUNCTION, declared with DATA without VALUE
* v is never changed, except by CLEAR v., and its address is never taken
* v has exactly one read, the complete source of x = v., where x is not an inline declaration
* x and v are both reference types, or have identical types. Initial values convert differently between
  types, e.g. an initial d becomes '00000000' in a string
* the declaration and the CLEARs are not chained

Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the declaration and the CLEARs, and replaces x = v. with CLEAR x.
No release requirement.`,
      tags: [RuleTag.Quickfix, RuleTag.SingleFile],
      badExample: `DATA lo_empty TYPE REF TO zcl_node.
ro_result = lo_empty.`,
      goodExample: `CLEAR ro_result.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CopyOfInitialVariableConf) {
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
        const reads = variable.reads();
        const writes = variable.writes();
        if (variable.inline || !plainData(declaration) || declaration.getColon() !== undefined
            || variable.escapes() || reads.length !== 1
            || writes.some(w => plainClear(w.statement)?.getStart().equals(w.token.getStart()) !== true
              || w.statement.getColon() !== undefined)) {
          continue;
        }
        const read = reads[0];
        const move = plainMove(read.statement);
        if (move === undefined || move.operator !== "="
            || singleField(move.source)?.getStart().equals(read.token.getStart()) !== true
            || move.target.findFirstExpression(Expressions.InlineData) !== undefined) {
          continue;
        }
        const type = variable.identifier.getType();
        const target = targetType(procedure, move.target);
        if (target === undefined
            || (!(isReferenceType(type) && isReferenceType(target)) && !identicalTypes(type, target))) {
          continue;
        }

        const edits: IEdit[] = [
          deleteStatement(procedure.file, declaration),
          EditHelper.replaceRange(procedure.file, read.statement.getStart(), read.statement.getEnd(),
                                  "CLEAR " + nodeText(procedure.file, move.target) + ".")];
        for (const write of writes) {
          edits.push(deleteStatement(procedure.file, write.statement));
        }
        const fix = mergeEdits(procedure.file, edits);
        const message = variable.identifier.getName() + " is always initial, use CLEAR";
        issues.push(Issue.atStatement(procedure.file, read.statement, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }
}
