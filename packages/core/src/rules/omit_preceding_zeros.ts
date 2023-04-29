import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {CallScreen, SetScreen} from "../abap/2_statements/statements";

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
    const message = "Omit preceding zeros";

    for (const s of file.getStatements()) {
      for (const i of s.findAllExpressions(Expressions.Integer)) {
        const token = i.getLastToken();
        const str = token.getStr();
        if (str.length > 1 && str.startsWith("0")) {
          if (s.get() instanceof CallScreen || s.get() instanceof SetScreen) {
            continue;
          }

          const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.getConfig().severity);
          issues.push(issue);
        }
      }

      for (const i of s.findAllExpressions(Expressions.ParameterException)) {
        const token = i.findDirectExpression(Expressions.SimpleName)?.getFirstToken();
        const str = token?.getStr();
        if (token && str && str.length > 1 && str.startsWith("0")) {
          const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.getConfig().severity);
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}