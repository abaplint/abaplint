import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper} from "../edit_helper";
import {Comment} from "../abap/2_statements/statements/_statement";

export class UnnecessaryChainingConf extends BasicRuleConfig {
}

export class UnnecessaryChaining extends ABAPRule {

  private conf = new UnnecessaryChainingConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_chaining",
      title: "Unnecessary Chaining",
      shortDescription: `Find unnecessary chaining, all statements are checked`,
      extendedInformation: ``,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
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

      let j = 1;
      let nextStatement = statements[i + j];
      while (nextStatement?.get() instanceof Comment) {
        j++;
        nextStatement = statements[i + j];
      }

      j = 1;
      let prevStatement = statements[i - j];
      while (prevStatement?.get() instanceof Comment) {
        j--;
        prevStatement = statements[i - j];
      }

      const next = nextStatement?.getColon();
      const prev = prevStatement?.getColon();
      if (next !== undefined && colon.getStart().equals(next.getStart())) {
        continue;
      } else if (prev !== undefined && colon.getStart().equals(prev.getStart())) {
        continue;
      }

      const fix = EditHelper.deleteRange(file, colon.getStart(), colon.getEnd());
      const message = "Unnecessary chaining";
      const issue = Issue.atToken(file, colon, message, this.getMetadata().key, this.conf.severity, fix);
      issues.push(issue);
    }

    return issues;
  }

}
