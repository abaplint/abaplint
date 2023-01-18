import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {IEdit} from "../edit_helper";
import {MacroCall} from "../abap/2_statements/statements/_statement";

export class ExpandMacrosConf extends BasicRuleConfig {

}

export class ExpandMacros extends ABAPRule {

  private conf = new ExpandMacrosConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "expand_macros",
      title: "Expand Macros",
      shortDescription: `Allows expanding macro calls with quick fixes`,
      extendedInformation: `Macros: https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abenmacros_guidl.htm

Note that macros/DEFINE cannot be used in the ABAP Cloud programming model`,
      tags: [RuleTag.Styleguide, RuleTag.Quickfix, RuleTag.Upport],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ExpandMacrosConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    const message = "Expand macro call";

    for (const statementNode of file.getStatements()) {
      const statement = statementNode.get();
      const fix: IEdit | undefined = undefined;

      if (!(statement instanceof MacroCall)) {
        continue;
      }

      issues.push(Issue.atStatement(file, statementNode, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

}
