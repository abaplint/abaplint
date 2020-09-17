import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {TypeTable} from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";

export class AvoidUseConf extends BasicRuleConfig {
  /** Detects define (macro definitions)
   * https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abenmacros_guidl.htm
  */
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

  public getMetadata(): IRuleMetadata {
    return {
      key: "avoid_use",
      title: "Avoid use of certain statements",
      shortDescription: `Detects usage of certain statements.`,
      extendedInformation: `DEFAULT KEY: https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#avoid-default-key`,
      tags: [RuleTag.Styleguide],
    };
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
    let isStaticsBlock: boolean = false;
    for (const statementNode of file.getStatements()) {
      const statement = statementNode.get();
      let message: string | undefined = undefined;
      if (this.conf.define && statement instanceof Statements.Define) {
        message = "DEFINE";
      } else if (this.conf.endselect && statement instanceof Statements.EndSelect) {
        message = "ENDSELECT";
      } else if (this.conf.execSQL && statement instanceof Statements.ExecSQL) {
        message = "EXEC SQL";
      } else if (this.conf.kernelCall && statement instanceof Statements.CallKernel) {
        message = "KERNEL CALL";
      } else if (this.conf.systemCall && statement instanceof Statements.SystemCall) {
        message = "SYSTEM-CALL";
      } else if (this.conf.communication && statement instanceof Statements.Communication) {
        message = "COMMUNICATION";
      } else if (this.conf.statics && statement instanceof Statements.StaticBegin) {
        isStaticsBlock = true;
        message = "STATICS";
      } else if (this.conf.statics && statement instanceof Statements.StaticEnd) {
        isStaticsBlock = false;
      } else if (this.conf.statics && statement instanceof Statements.Static && isStaticsBlock === false) {
        message = "STATICS";
      } else if (this.conf.break && statement instanceof Statements.Break) {
        message = "BREAK/BREAK-POINT";
      }
      if (message) {
        const issue = Issue.atStatement(file, statementNode, this.getDescription(message), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }

      if (this.conf.defaultKey
          && (statement instanceof Statements.Data || statement instanceof Statements.Type)) {
        const tt = statementNode.findFirstExpression(TypeTable);
        const token = tt?.findDirectTokenByText("DEFAULT");
        if (tt && token) {
          tt.concatTokensWithoutStringsAndComments().toUpperCase().endsWith("DEFAULT KEY");
          message = "DEFAULT KEY";
          const issue = Issue.atToken(file, token, this.getDescription(message), this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }

    }

    return issues;
  }
}