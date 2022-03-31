import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode} from "../abap/nodes";

export class NoAliasesConf extends BasicRuleConfig {
}

export class NoAliases extends ABAPRule {
  private conf = new NoAliasesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_aliases",
      title: "No ALIASES",
      shortDescription: `Detects use of the ALIAS statement`,
      extendedInformation: `Only one issue is reported for chained statements`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NoAliasesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const message = "Do not use ALIASES";
    let prev: StatementNode | undefined = undefined;
    for (const stat of file.getStatements()) {
      if (stat.get() instanceof Statements.Aliases) {
        if (prev && prev.getColon() === stat.getColon()) {
          continue;
        }
        issues.push(Issue.atStatement(file, stat, message, this.getMetadata().key, this.conf.severity));
        prev = stat;
      }
    }

    return issues;
  }

}