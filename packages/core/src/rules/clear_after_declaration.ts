import {Issue} from "../issue";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ObjectAnalysis, OccurrenceKind, deleteStatement, initialAtFirstReference, plainClear} from "./_procedure_analysis";

export class ClearAfterDeclarationConf extends BasicRuleConfig {
}

export class ClearAfterDeclaration implements IRule {
  private reg: IRegistry;
  private conf = new ClearAfterDeclarationConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "clear_after_declaration",
      title: "CLEAR after declaration",
      shortDescription: `Finds CLEAR of a local variable that is still initial since its declaration`,
      extendedInformation: `Reports CLEAR x. when all of the following hold:

* x is a local variable of a METHOD, FORM or FUNCTION, declared with DATA x TYPE/LIKE ... without VALUE,
  or with DATA(x) = VALUE t( ). with an explicit type and nothing in the parentheses
* the CLEAR is the first reference to x after the declaration, it has no WITH addition
* neither the declaration nor the CLEAR is inside a LOOP, DO, WHILE, SELECT loop, PROVIDE, or a TRY block with
  RETRY, RESUME or CATCH BEFORE UNWIND. DATA is not executed per iteration, so a CLEAR in a loop can be needed.
  DATA(x) = VALUE t( ). is executed per iteration, it may also be in the same loop as the CLEAR, if the CLEAR is
  in the block of the declaration or a nested block

Any later use of x does not matter, the CLEAR can only be reached with x still initial.
Objects with syntax errors, macros or unknown statements are skipped, as are procedures with dynamic code,
INCLUDE, test seams, enhancements or native SQL.

The quick fix deletes the CLEAR. No release requirement.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA lv_count TYPE i.
CLEAR lv_count.`,
      goodExample: `DATA lv_count TYPE i.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ClearAfterDeclarationConf) {
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
        const first = variable.occurrences[0];
        if (first === undefined
            || first.kind !== OccurrenceKind.Write
            || plainClear(first.statement)?.getStart().equals(first.token.getStart()) !== true
            || !initialAtFirstReference(procedure, variable, first.statement)) {
          continue;
        }
        const fix = deleteStatement(procedure.file, first.statement);
        issues.push(Issue.atStatement(procedure.file, first.statement,
                                      "CLEAR of " + variable.identifier.getName() + ", which is still initial",
                                      this.getMetadata().key, this.conf.severity, fix));
      }
    }
    return issues;
  }
}
