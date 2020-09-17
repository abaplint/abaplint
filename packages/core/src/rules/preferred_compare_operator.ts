import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {EditHelper} from "../edit_helper";
import {Token} from "../abap/1_lexer/tokens/_token";

export class PreferredCompareOperatorConf extends BasicRuleConfig {
  /** Operators which are not allowed */
  public badOperators: string[] = ["EQ", "><", "NE", "GE", "GT", "LT", "LE"];
}

export class PreferredCompareOperator extends ABAPRule {

  private conf = new PreferredCompareOperatorConf();

  private readonly operatorMapping: Map<string, string> = new Map<string, string>();

  public getMetadata() {
    return {
      key: "preferred_compare_operator",
      title: "Preferred compare operator",
      shortDescription: `Configure undesired operator variants`,
    };
  }

  private getDescription(operator: string): string {
    return "Compare operator \"" + operator + "\" not preferred";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: PreferredCompareOperatorConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    this.buildMapping();
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const operators = struc.findAllExpressionsMulti([Expressions.CompareOperator, Expressions.SQLCompareOperator]);
    for (const op of operators) {
      const token = op.getLastToken();
      // todo, performance, lookup in hash map instead(JS object)
      if (this.conf.badOperators.indexOf(token.getStr().toUpperCase()) >= 0) {
        issues.push(this.createIssue(token, file));
      }
    }

    return issues;
  }

  private buildMapping() {
    if (this.operatorMapping.size === 0) {
      this.operatorMapping.set("EQ", "=");
      this.operatorMapping.set("><", "<>");
      this.operatorMapping.set("NE", "<>");
      this.operatorMapping.set("GE", ">=");
      this.operatorMapping.set("GT", ">");
      this.operatorMapping.set("LT", "<");
      this.operatorMapping.set("LE", "<=");

      this.operatorMapping.set("=", "EQ");
      this.operatorMapping.set("<>", "NE");
      this.operatorMapping.set(">=", "GE");
      this.operatorMapping.set(">", "GT");
      this.operatorMapping.set("<", "LT");
      this.operatorMapping.set("<=", "LE");
    }
  }

  private createIssue(token: Token, file: ABAPFile): Issue {
    const message = this.getDescription(token.getStr());
    const replacementToken = this.operatorMapping?.get(token.getStr());
    // values in badOperators can be entered by the user and may not necessarily be actual operators
    if (replacementToken) {
      const fix = EditHelper.replaceRange(file, token.getStart(), token.getEnd(), replacementToken);
      const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity, fix);
      return issue;
    }
    else {
      const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
      return issue;
    }
  }

}