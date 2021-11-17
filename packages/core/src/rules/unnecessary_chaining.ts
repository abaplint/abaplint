import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class UnnecessaryChainingConf extends BasicRuleConfig {
  public onlyConstants: boolean = false;
}

export class UnnecessaryChaining extends ABAPRule {

  private conf = new UnnecessaryChainingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_chaining",
      title: "Unnecessary Chaining",
      shortDescription: `Find unnecessary chaining, all statements are checked`,
      extendedInformation: ``,
      tags: [RuleTag.SingleFile],
      badExample: `WRITE: bar.`,
      goodExample: `WRITE bar.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnnecessaryChainingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const statements = file.getStatements();
    for (let i = 0; i < statements.length; i++) {
      const colon = statements[i].getColon();
      if (colon === undefined) {
        continue;
      }
      const next = statements[i + 1]?.getColon();
      const prev = statements[i - 1]?.getColon();
      if (next !== undefined && colon.getStart().equals(next.getStart())) {
        continue;
      } else if (prev !== undefined && colon.getStart().equals(prev.getStart())) {
        continue;
      }

      const message = "Unnecessary chaining";
      const issue = Issue.atStatement(file, statements[i], message, this.getMetadata().key);
      issues.push(issue);
    }

    return issues;
  }

}
