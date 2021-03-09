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