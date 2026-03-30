import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import * as Structures from "../abap/3_structures/structures";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";

export class CatchAndRaiseConf extends BasicRuleConfig {
}

export class CatchAndRaise extends ABAPRule {
  private conf = new CatchAndRaiseConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "catch_and_raise",
      title: "Catch and re-raise same exception",
      shortDescription: `Reports CATCH blocks that only re-raise the caught exception without any handling`,
      badExample: `TRY.\n  something( ).\nCATCH zcx_something INTO DATA(lv_exc).\n  RAISE EXCEPTION lv_exc.\nENDTRY.`,
      goodExample: `TRY.\n  something( ).\nCATCH zcx_something.\n  " handle exception\nENDTRY.`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CatchAndRaiseConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const catchStruct of stru.findAllStructures(Structures.Catch)) {
      const catchStatement = catchStruct.findDirectStatement(Statements.Catch);
      if (catchStatement === undefined) {
        continue;
      }

      const target = catchStatement.findFirstExpression(Expressions.Target);
      if (target === undefined) {
        continue;
      }

      const targetField = target.findFirstExpression(Expressions.TargetField);
      if (targetField === undefined) {
        continue;
      }
      const caughtVar = targetField.getFirstToken().getStr().toUpperCase();

      const allStatements = catchStruct.findAllStatementNodes();
      if (allStatements.length !== 2) {
        continue;
      }
      if (!(allStatements[1].get() instanceof Statements.Raise)) {
        continue;
      }

      const raiseStatement = allStatements[1];
      const raiseConcat = raiseStatement.concatTokens().toUpperCase().replace(/\.$/, "").trim();
      if (!raiseConcat.startsWith("RAISE EXCEPTION ")) {
        continue;
      }
      const parts = raiseConcat.split(/\s+/);
      if (parts.length !== 3) {
        continue;
      }

      if (parts[2] === caughtVar) {
        issues.push(Issue.atStatement(
          file,
          catchStatement,
          this.getMessage(),
          this.getMetadata().key,
          this.conf.severity));
      }
    }

    return issues;
  }

  private getMessage(): string {
    return "Caught exception is immediately re-raised, CATCH block has no effect";
  }
}
