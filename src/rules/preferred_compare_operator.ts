import * as Expressions from "../abap/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Configure undesired operator variants */
export class PreferredCompareOperatorConf extends BasicRuleConfig {
  /** Operators which are not allowed */
  public badOperators: string[] = ["EQ", "><", "NE", "GE", "GT", "LT", "LE"];
}

export class PreferredCompareOperator extends ABAPRule {

  private conf = new PreferredCompareOperatorConf();

  public getKey(): string {
    return "preferred_compare_operator";
  }

  private getDescription(operator: string): string {
    return "Compare operator " + operator + " not preferred";
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const operators = struc.findAllExpressions(Expressions.CompareOperator).concat(
      struc.findAllExpressions(Expressions.SQLCompareOperator));
    for (const op of operators) {
      const token = op.getLastToken();
      if (this.conf.badOperators.indexOf(token.getStr()) >= 0) {
        const message = this.getDescription(token.getStr());
        const issue = Issue.atToken(file, token, message, this.getKey());
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