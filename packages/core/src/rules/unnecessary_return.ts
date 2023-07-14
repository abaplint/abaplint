import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import * as Statements from "../abap/2_statements/statements";
import {EditHelper} from "../edit_helper";

export class UnnecessaryReturnConf extends BasicRuleConfig {
}

export class UnnecessaryReturn extends ABAPRule {
  private conf = new UnnecessaryReturnConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_return",
      title: "Unnecessary Return",
      shortDescription: `Finds unnecessary RETURN statements`,
      extendedInformation: `Finds unnecessary RETURN statements`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
      badExample: `FORM hello1.
  WRITE 'world'.
  RETURN.
ENDFORM.

FORM foo.
  IF 1 = 2.
    RETURN.
  ENDIF.
ENDFORM.`,
      goodExample: `FORM hello2.
  WRITE 'world'.
ENDFORM.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnnecessaryReturnConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const message = "Unnecessary RETURN";

    const statements = file.getStatements();
    for (let i = 0; i < statements.length; i++) {
      const node = statements[i];
      if (!(node.get() instanceof Statements.EndMethod
          || node.get() instanceof Statements.EndForm
          || node.get() instanceof Statements.EndFunction)) {
        continue;
      }

      const prev = statements[i - 1];
      if (prev && prev.get() instanceof Statements.Return) {
        const fix = EditHelper.deleteStatement(file, prev);
        issues.push(Issue.atStatement(file, prev, message, this.getMetadata().key, this.getConfig().severity, fix));
      }

      // note: ENDTRY is not checked, it will usually just make it an empty catch handler, which is also bad
      const prevprev = statements[i - 2];
      if (prev && prevprev
          && prevprev.get() instanceof Statements.Return
          && prev.get() instanceof Statements.EndIf) {
        const fix = EditHelper.deleteStatement(file, prevprev);
        issues.push(Issue.atStatement(file, prevprev, message, this.getMetadata().key, this.getConfig().severity, fix));
      }
    }

    return issues;
  }

}