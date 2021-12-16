import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class NoAliasesConf extends BasicRuleConfig {
}

export class NoAliases extends ABAPRule {
  private conf = new NoAliasesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "no_aliases",
      title: "No ALIASES",
      shortDescription: `Detects use of the ALIAS statement`,
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
    for (const stat of file.getStatements()) {
      if (stat.get() instanceof Statements.Aliases) {
        issues.push(Issue.atStatement(file, stat, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}