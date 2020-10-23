import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {TypeTable} from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Version} from "../version";

export class AvoidUseConf extends BasicRuleConfig {
  /** Detects DEFINE (macro definitions) */
  public define: boolean = true;
  /** Detects ENDSELECT */
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
  /** Detects DEFAULT KEY definitions, from version v740sp02 and up */
  public defaultKey: boolean = true;
  /** Detects BREAK and BREAK-POINTS */
  public break: boolean = true;
  /** Detects DESRIBE TABLE LINES, use lines() instead */
  public describeLines: boolean = true;
}

export class AvoidUse extends ABAPRule {

  private conf = new AvoidUseConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "avoid_use",
      title: "Avoid use of certain statements",
      shortDescription: `Detects usage of certain statements.`,
      extendedInformation: `
DEFAULT KEY: https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md#avoid-default-key

Macros: https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abenmacros_guidl.htm

ENDSELECT: not reported when the corresponding SELECT has PACKAGE SIZE

DESRIBE TABLE LINES: use lines() instead`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
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
      } else if (this.conf.execSQL && statement instanceof Statements.ExecSQL) {
        message = "EXEC SQL";
      } else if (this.conf.kernelCall && statement instanceof Statements.CallKernel) {
        message = "KERNEL CALL";
      } else if (this.conf.describeLines && statement instanceof Statements.Describe) {
        const children = statementNode.getChildren();
        if (children.length === 6 && children[3].getFirstToken().getStr().toUpperCase() === "LINES") {
          message = "DESCRIBE LINES, use lines() instead";
        }
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
          && (this.reg.getConfig().getVersion() >= Version.v740sp02
          || this.reg.getConfig().getVersion() === Version.Cloud)
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

    if (this.conf.endselect) {
      for (const s of file.getStructure()?.findAllStructures(Structures.Select) || []) {
        const select = s.findDirectStatement(Statements.SelectLoop);
        if (select === undefined || select.concatTokens().includes("PACKAGE SIZE")) {
          continue;
        }
        const issue = Issue.atStatement(file, select, this.getDescription("ENDSELECT"), this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }
}