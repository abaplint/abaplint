import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode} from "../abap/nodes/statement_node";

export class DbOperationInLoopConf extends BasicRuleConfig {
}

export class DbOperationInLoop extends ABAPRule {

  private conf = new DbOperationInLoopConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "db_operation_in_loop",
      title: "Database operation in loop",
      shortDescription: `Database operation in LOOP/DO/WHILE`,
      tags: [RuleTag.SingleFile, RuleTag.Performance],
      badExample: `LOOP AT lt_items INTO DATA(ls_item).
  SELECT SINGLE name FROM zcustomer INTO @DATA(lv_name) WHERE id = @ls_item-customer_id.
ENDLOOP.`,
      goodExample: `ASSERT lines( lt_items ) > 0.
SELECT id, name FROM zcustomer INTO TABLE @DATA(lt_customers)
  FOR ALL ENTRIES IN @lt_items
  WHERE id = @lt_items-customer_id.

LOOP AT lt_items INTO DATA(ls_item).
  READ TABLE lt_customers INTO DATA(ls_customer) WITH KEY id = ls_item-customer_id.
ENDLOOP.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DbOperationInLoopConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues;
    }

    const loops = stru.findAllStructures(Structures.Loop);
    loops.push(...stru.findAllStructures(Structures.Do));
    loops.push(...stru.findAllStructures(Structures.While));

    for (const l of loops) {
      let found: StatementNode | undefined = undefined;
      if (found === undefined) {
        found = l.findFirstStatement(Statements.Select);
      }
      if (found === undefined) {
        found = l.findFirstStatement(Statements.SelectLoop);
      }
      if (found === undefined) {
        found = l.findFirstStatement(Statements.InsertDatabase);
      }
      if (found === undefined) {
        found = l.findFirstStatement(Statements.DeleteDatabase);
      }
      if (found === undefined) {
        found = l.findFirstStatement(Statements.UpdateDatabase);
      }
      if (found === undefined) {
        found = l.findFirstStatement(Statements.ModifyDatabase);
      }

      if (found) {
        const message = "Database operation in loop";
        issues.push(Issue.atStatement(file, found, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}
