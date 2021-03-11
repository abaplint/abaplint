import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class SelectAlwaysOrderByConf extends BasicRuleConfig {
}

export class SelectAlwaysOrderBy extends ABAPRule {

  private conf = new SelectAlwaysOrderByConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_always_order_by",
      title: "SELECT always ORDER BY",
      shortDescription: `SELECTs should always have a ORDER BY clause

This will make sure that the SELECT statement returns results in the same sequence on different databases

add ORDER BY PRIMARY KEY if in doubt`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectAlwaysOrderByConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues;
    }

    const selects = stru.findAllStatements(Statements.Select);
    selects.push(...stru.findAllStatements(Statements.SelectLoop));
    for (const s of selects) {
      const c = s.concatTokens();
      if (c.startsWith("SELECT SINGLE ")) {
        continue;
      }
      if (s.findFirstExpression(Expressions.SQLOrderBy) === undefined) {
        issues.push(Issue.atStatement(file, s, "Always add ORDER BY", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}