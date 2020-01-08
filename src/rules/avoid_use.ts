import * as Statements from "../abap/statements/";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {TypeTable} from "../abap/expressions";

/** Detects usage of certain statements. */
export class AvoidUseConf extends BasicRuleConfig {
  /** Detects define (macro definitions) */
  public define: boolean = true;
  /** Detects endselect */
  public endselect: boolean = true;
  /** Detects execSQL (dynamic SQL) */
  public execSQL: boolean = true;
  /** Detects kernel calls */
  public kernelCall: boolean = true;
  /** Detects communication */
  public communication: boolean = true;
  /** Detects statics */
  public statics: boolean = true;
  /** Detects SYSTEM-CALL */
  public systemCall: boolean = true;
  /** Detects DEFAULT KEY definitions */
  public defaultKey: boolean = true;
  /** Detects BREAK and BREAK-POINTS */
  public break: boolean = true;
}

export class AvoidUse extends ABAPRule {

  private conf = new AvoidUseConf();

  public getKey(): string {
    return "avoid_use";
  }

  private getDescription(statement: string): string {
    return "Avoid use of " + statement;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AvoidUseConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      let message: string | undefined = undefined;
      if (this.conf.define && statement.get() instanceof Statements.Define) {
        message = "DEFINE";
      } else if (this.conf.endselect && statement.get() instanceof Statements.EndSelect) {
        message = "ENDSELECT";
      } else if (this.conf.execSQL && statement.get() instanceof Statements.ExecSQL) {
        message = "EXEC SQL";
      } else if (this.conf.kernelCall && statement.get() instanceof Statements.CallKernel) {
        message = "KERNEL CALL";
      } else if (this.conf.systemCall && statement.get() instanceof Statements.SystemCall) {
        message = "SYSTEM-CALL";
      } else if (this.conf.communication && statement.get() instanceof Statements.Communication) {
        message = "COMMUNICATION";
      } else if (this.conf.statics && statement.get() instanceof Statements.Static) {
        message = "STATICS";
      } else if (this.conf.break && statement.get() instanceof Statements.Break) {
        message = "BREAK/BREAK-POINT";
      } else if (this.conf.defaultKey
          && (statement.get() instanceof Statements.Data || statement.get() instanceof Statements.Type)
          && statement.findFirstExpression(TypeTable)?.concatTokensWithoutStringsAndComments().toUpperCase().endsWith("DEFAULT KEY")) {
        message = "DEFAULT KEY";
      }
      if (message) {
        const issue = Issue.atStatement(file, statement, this.getDescription(message), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}