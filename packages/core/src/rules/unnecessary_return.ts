import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import * as Statements from "../abap/2_statements/statements";
import {EditHelper} from "../edit_helper";

export class UnnecessaryReturnConf extends BasicRuleConfig {
}

// todo: make this rule more intelligent, eg RETURN. ENDTRY. ENDMETHOD.

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

    const statements = file.getStatements();
    for (let i = 0; i < statements.length - 1; i++) {
      const node = statements[i];
      const next = statements[i + 1];
      if (node.get() instanceof Statements.Return
          && (next.get() instanceof Statements.EndMethod
          || next.get() instanceof Statements.EndForm
          || next.get() instanceof Statements.EndFunction)) {

        const message = "Unnecessary RETURN";
        const fix = EditHelper.deleteStatement(file, node);
        issues.push(Issue.atStatement(file, node, message, this.getMetadata().key, this.getConfig().severity, fix));
      }
    }

    return issues;
  }

}