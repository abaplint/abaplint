import {Issue} from "../issue";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class UnnecessaryLoopGuardConf extends BasicRuleConfig {
}

export class UnnecessaryLoopGuard extends ABAPRule {

  private conf = new UnnecessaryLoopGuardConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unnecessary_loop_guard",
      title: "Unnecessary loop guard",
      shortDescription: `Detects unnecessary IS [NOT] INITIAL check before LOOP AT`,
      extendedInformation: `LOOP AT iterates zero times on an empty table, so an IS [NOT] INITIAL guard is redundant.`,
      tags: [RuleTag.SingleFile, RuleTag.Styleguide],
      badExample: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`,
      goodExample: `LOOP AT lt_data INTO DATA(ls_item).
  WRITE ls_item-name.
ENDLOOP.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnnecessaryLoopGuardConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues;
    }

    for (const ifStru of stru.findAllStructuresRecursive(Structures.If)) {
      if (ifStru.findDirectStructures(Structures.ElseIf).length > 0
          || ifStru.findDirectStructures(Structures.Else).length > 0) {
        continue;
      }

      const ifStatement = ifStru.findDirectStatement(Statements.If);
      if (ifStatement === undefined) {
        continue;
      }

      const cond = ifStatement.findDirectExpression(Expressions.Cond);
      if (cond === undefined) {
        continue;
      }

      const compareNodes = cond.findDirectExpressions(Expressions.Compare);
      if (compareNodes.length !== 1) {
        continue;
      }

      const m = compareNodes[0].concatTokens().toUpperCase().match(/^(.+?)\s+IS\s+(?:NOT\s+)?INITIAL\s*$/);
      if (!m) {
        continue;
      }
      const tableName = m[1];

      const bodyStructures = ifStru.findDirectStructures(Structures.Body);
      if (bodyStructures.length !== 1) {
        continue;
      }
      const normalStructures = bodyStructures[0].findDirectStructures(Structures.Normal);
      if (normalStructures.length !== 1) {
        continue;
      }
      const loopStructures = normalStructures[0].findDirectStructures(Structures.Loop);
      if (loopStructures.length !== 1) {
        continue;
      }

      const loopStatement = loopStructures[0].findDirectStatement(Statements.Loop);
      if (loopStatement === undefined) {
        continue;
      }
      const loopSource = loopStatement.findFirstExpression(Expressions.LoopSource);
      if (loopSource === undefined) {
        continue;
      }

      if (loopSource.concatTokens().toUpperCase() !== tableName) {
        continue;
      }

      issues.push(Issue.atStatement(
        file,
        ifStatement,
        "Unnecessary IS [NOT] INITIAL check before LOOP AT",
        this.getMetadata().key,
        this.conf.severity,
      ));
    }

    return issues;
  }

}
