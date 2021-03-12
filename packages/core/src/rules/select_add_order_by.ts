import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class SelectAddOrderByConf extends BasicRuleConfig {
}

export class SelectAddOrderBy extends ABAPRule {

  private conf = new SelectAddOrderByConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_add_order_by",
      title: "SELECT add ORDER BY",
      shortDescription: `SELECTs add ORDER BY clause

This will make sure that the SELECT statement returns results in the same sequence on different databases

add ORDER BY PRIMARY KEY if in doubt`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectAddOrderByConf): void {
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

      // skip COUNT(*)
      const list = s.findFirstExpression(Expressions.SQLFieldList);
      if (list?.getChildren().length === 1 && list.getFirstChild()?.get() instanceof Expressions.SQLAggregation) {
        continue;
      }

      if (s.findFirstExpression(Expressions.SQLOrderBy) === undefined) {
        issues.push(Issue.atStatement(file, s, "Add ORDER BY", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}