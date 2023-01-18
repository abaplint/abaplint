import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper} from "../edit_helper";
import {MacroCall} from "../abap/2_statements/statements/_statement";
import {VirtualPosition} from "../position";

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

    const statements = file.getStatements();
    for (let i = 0; i < statements.length; i++) {
      const statementNode = statements[i];
      const statement = statementNode.get();

      if (!(statement instanceof MacroCall)) {
        continue;
      }

      let replace = "";
      for (let j = i + 1; j < statements.length; j++) {
        const sub = statements[j];
        if (sub.getFirstToken().getStart() instanceof VirtualPosition) {
          replace += sub.concatTokens();
        } else {
          break;
        }
      }

      const fix = EditHelper.replaceRange(file, statementNode.getStart(), statementNode.getEnd(), replace);
      issues.push(Issue.atStatement(file, statementNode, message, this.getMetadata().key, this.conf.severity, fix));
    }

    return issues;
  }

}
