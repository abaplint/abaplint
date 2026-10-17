import * as Expressions from "../abap/2_statements/expressions";
import {EditHelper, IEdit} from "../edit_helper";
import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, OccurrenceKind, SourceKind, dataSource, deleteStatement, isCondition, mergeEdits,
  plainMove} from "./_procedure_analysis";

export class AliasNeverReassignedConf extends BasicRuleConfig {
}

export class AliasNeverReassigned implements IRule {
  private reg: IRegistry;
  private conf = new AliasNeverReassignedConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "alias_never_reassigned",
      title: "Alias never reassigned",
      shortDescription: `Finds DATA(a) = b. where neither a nor b changes afterwards, so b can be read instead of a`,
      extendedInformation: `Reports DATA(a) = b. when all of the following hold:

* a is a local variable of a METHOD, FORM or FUNCTION, and has at least two more references, all of them reads,
  which do not take its address, bind a field symbol to it, or pass it to USING, CHANGING or EXPORTING
* b is a local variable, or a component of one, whose address is never taken and which is not written
  after the declaration of a; or b is a constant or me
* the declaration is executed before every read on every path: each read is in the block of the declaration
  or a nested block

a has the type of b, so reading b instead does not change any conversion.
A constant b read in IF, ELSEIF, WHILE, CHECK, CASE or WHEN is not reported, see constant_condition.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the declaration and replaces every read of a with b. No release requirement.

See also unnecessary_copy for copies that are read once, also of attributes and parameters.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA(lo_file) = lo_input.
lo_file->read( ).
rv_name = lo_file->get_name( ).`,
      goodExample: `lo_input->read( ).
rv_name = lo_input->get_name( ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AliasNeverReassignedConf) {
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
        const reads = variable.occurrences;
        if (move === undefined || move.operator !== "="
            || move.target.getChildren().length !== 1
            || move.target.findDirectExpression(Expressions.InlineData) === undefined
            || reads.length < 2 || reads.some(r => r.kind !== OccurrenceKind.Read)
            || reads.some(r => !procedure.dominates(declaration, r.statement))) {
          continue;
        }
        const source = dataSource(procedure, move.source);
        if (source === undefined || source.base === variable
            || (source.kind === SourceKind.Immutable && reads.some(r => isCondition(r.statement)))
            || (source.kind === SourceKind.Local
            && (source.base!.escapes() || source.base!.writes().some(w => w.index >= procedure.index(declaration))))
            || source.kind === SourceKind.Volatile) {
          continue;
        }
        const edits: IEdit[] = [deleteStatement(procedure.file, declaration)];
        for (const read of reads) {
          edits.push(EditHelper.replaceToken(procedure.file, read.token, source.text));
        }
        const fix = mergeEdits(procedure.file, edits);
        const message = variable.identifier.getName() + " is a copy of " + source.text + ", and neither changes";
        issues.push(Issue.atStatement(procedure.file, declaration, message, this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }
}
