import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode} from "../abap/nodes";

export class DangerousStatementConf extends BasicRuleConfig {
  /** Detects execSQL (dynamic SQL) */
  public execSQL: boolean = true;
  /** Detects kernel calls */
  public kernelCall: boolean = true;
  /** Detects SYSTEM-CALL */
  public systemCall: boolean = true;
  /** Detects INSERT REPORT */
  public insertReport: boolean = true;
  public generateDynpro: boolean = true;
  public generateReport: boolean = true;
  public generateSubroutine: boolean = true;
  public deleteReport: boolean = true;
  public deleteTextpool: boolean = true;
  public deleteDynpro: boolean = true;
  public importDynpro: boolean = true;
  /** Finds instances of dynamic SQL: SELECT, UPDATE, DELETE, INSERT, MODIFY */
  public dynamicSQL: boolean = true;
}

export class DangerousStatement extends ABAPRule {

  private conf = new DangerousStatementConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "dangerous_statement",
      title: "Dangerous statement",
      shortDescription: `Detects potentially dangerous statements`,
      extendedInformation: `Dynamic SQL: Typically ABAP logic does not need dynamic SQL`,
      tags: [RuleTag.SingleFile, RuleTag.Security],
    };
  }

  private getDescription(statement: string): string {
    return "Potential dangerous statement " + statement;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: DangerousStatementConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statementNode of file.getStatements()) {
      const statement = statementNode.get();
      let message: string | undefined = undefined;
      if (this.conf.execSQL && statement instanceof Statements.ExecSQL) {
        message = "EXEC SQL";
      } else if (this.conf.kernelCall && statement instanceof Statements.CallKernel) {
        message = "KERNEL CALL";
      } else if (this.conf.systemCall && statement instanceof Statements.SystemCall) {
        message = "SYSTEM-CALL";
      } else if (this.conf.insertReport && statement instanceof Statements.InsertReport) {
        message = "INSERT REPORT";
      } else if (this.conf.generateDynpro && statement instanceof Statements.GenerateDynpro) {
        message = "GENERATE DYNPRO";
      } else if (this.conf.generateReport && statement instanceof Statements.GenerateReport) {
        message = "GENERATE REPORT";
      } else if (this.conf.generateSubroutine && statement instanceof Statements.GenerateSubroutine) {
        message = "GENERATE SUBROUTINE";
      } else if (this.conf.deleteReport && statement instanceof Statements.DeleteReport) {
        message = "DELETE REPORT";
      } else if (this.conf.deleteTextpool && statement instanceof Statements.DeleteTextpool) {
        message = "DELETE TEXTPOOL";
      } else if (this.conf.deleteDynpro && statement instanceof Statements.DeleteDynpro) {
        message = "DELETE DYNPRO";
      } else if (this.conf.importDynpro && statement instanceof Statements.ImportDynpro) {
        message = "IMPORT DYNPRO";
      }

      if (message) {
        issues.push(Issue.atStatement(file, statementNode, this.getDescription(message), this.getMetadata().key, this.conf.severity));
      }

      message = this.findDynamicSQL(statementNode);
      if (message) {
        issues.push(Issue.atStatement(file, statementNode, this.getDescription(message), this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  private findDynamicSQL(statementNode: StatementNode): string | undefined {
    const statement = statementNode.get();
    if (statement instanceof Statements.UpdateDatabase
        || statement instanceof Statements.Select
        || statement instanceof Statements.SelectLoop
        || statement instanceof Statements.InsertDatabase
        || statement instanceof Statements.ModifyDatabase
        || statement instanceof Statements.DeleteDatabase) {
      if (statementNode.findFirstExpression(Expressions.Dynamic)) {
        return "Dynamic SQL";
      }
    }
    return undefined;
  }

}
