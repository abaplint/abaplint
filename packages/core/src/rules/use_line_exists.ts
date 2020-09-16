import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Version} from "../version";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes";
import {Comment} from "../abap/2_statements/statements/_statement";

export class UseLineExistsConf extends BasicRuleConfig {
}

export class UseLineExists extends ABAPRule {
  private conf = new UseLineExistsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_line_exists",
      title: "Use line_exists",
      shortDescription: `Use line_exists, from 740sp02 and up`,
      extendedInformation:
        `https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#prefer-line_exists-to-read-table-or-loop-at`,
      tags: [RuleTag.Upport, RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseLineExistsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    if (this.reg.getConfig().getVersion() < Version.v740sp02) {
      return [];
    }

    const statements = file.getStatements();
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.get() instanceof Statements.ReadTable
          && statement.concatTokens().toUpperCase().includes("TRANSPORTING NO FIELDS")
          && this.checksSubrc(i, statements)) {
        issues.push(Issue.atStatement(file, statement, "Use line_exists", this.getMetadata().key));
      }
    }

    return issues;
  }

///////////////////////

  private checksSubrc(index: number, statements: readonly StatementNode[]): boolean {
    for (let i = index + 1; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.get() instanceof Comment) {
        continue;
      } else if (statement.get() instanceof Statements.If) {
        const concat = statement.concatTokens().toUpperCase();
        return concat === "IF SY-SUBRC = 0."
          || concat === "IF SY-SUBRC = 4."
          || concat === "IF SY-SUBRC IS INITIAL."
          || concat === "IF NOT SY-SUBRC IS INITIAL."
          || concat === "IF SY-SUBRC IS NOT INITIAL."
          || concat === "IF SY-SUBRC <> 0."
          || concat === "IF SY-SUBRC <> 4.";
      }
      return false;
    }
    return false;
  }

}