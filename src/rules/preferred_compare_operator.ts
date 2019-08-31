import * as Expressions from "../abap/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

export class PreferredCompareOperatorConf extends BasicRuleConfig {
  public badOperators: string[] = ["EQ", "><", "NE", "GE", "GT", "LT", "LE"];
}

export class PreferredCompareOperator extends ABAPRule {

  private conf = new PreferredCompareOperatorConf();

  public getKey(): string {
    return "preferred_compare_operator";
  }

  public getDescription(): string {
    return "Compare operator not preferred";
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const operators = struc.findAllExpressions(Expressions.CompareOperator);
    for (const op of operators) {
      const token = op.getLastToken();
      if (this.conf.badOperators.indexOf(token.getStr()) >= 0) {
        const message = "Compare operator " + token.getStr() + " not preferred";
        const issue = new Issue({
          file,
          message,
          key: this.getKey(),
          start: token.getStart(),
          end: token.getEnd(),
        });
        issues.push(issue);
      }
    }

    return issues;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferredCompareOperatorConf) {
    this.conf = conf;
  }

}