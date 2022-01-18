import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class OmitPrecedingZerosConf extends BasicRuleConfig {
}

export class OmitPrecedingZeros extends ABAPRule {

  private conf = new OmitPrecedingZerosConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "omit_preceding_zeros",
      title: "Omit preceding zeros",
      shortDescription: `Omit preceding zeros from integer constants`,
      tags: [RuleTag.SingleFile],
      badExample: `int = -001.`,
      goodExample: `int = -1.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: OmitPrecedingZerosConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const i of file.getStructure()?.findAllExpressions(Expressions.Integer) || []) {
      const token = i.getLastToken();
      const str = token.getStr();
      if (str.length > 1 && str.startsWith("0")) {
        const message = "Omit preceding zeros";
        const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.getConfig().severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}