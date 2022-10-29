import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {TypeTable, TypeTableKey} from "../abap/2_statements/expressions";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {Version} from "../version";
import {StatementNode} from "../abap/nodes/statement_node";
import {EditHelper, IEdit} from "../edit_helper";

export class AvoidUseConf extends BasicRuleConfig {
  /** Do not emit quick fix suggestion */
  public skipQuickFix: boolean = false;
  /** Detects DEFINE (macro definitions) */
  public define: boolean = true;
  /** Detects statics */
  public statics: boolean = true;
  /** Detects DEFAULT KEY definitions, from version v740sp02 and up */
  public defaultKey: boolean = true;
  /** Detects BREAK and BREAK-POINTS */
  public break: boolean = true;
  /** Detects TEST SEAMS */
  public testSeams: boolean = true;
  /** Detects DESCRIBE TABLE LINES, use lines() instead */
  public describeLines: boolean = true;
}

export class AvoidUse extends ABAPRule {

  private conf = new AvoidUseConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "avoid_use",
      title: "Avoid use of certain statements",
      shortDescription: `Detects usage of certain statements.`,
      extendedInformation: `DEFAULT KEY: https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#avoid-default-key

Macros: https://help.sap.com/doc/abapdocu_752_index_htm/7.52/en-US/abenmacros_guidl.htm

STATICS: use CLASS-DATA instead

DESCRIBE TABLE LINES: use lines() instead (quickfix exists)

TEST-SEAMS: https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#use-test-seams-as-temporary-workaround`,
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
      let fix: IEdit | undefined = undefined;
      if (this.conf.define && statement instanceof Statements.Define) {
        message = "DEFINE";
      } else if (this.conf.describeLines && statement instanceof Statements.Describe) {
        const children = statementNode.getChildren();
        if (children.length === 6 && children[3].getFirstToken().getStr().toUpperCase() === "LINES") {
          message = "DESCRIBE LINES, use lines() instead";
          fix = this.conf.skipQuickFix === true ? undefined : this.getDescribeLinesFix(file, statementNode);
        }
      } else if (this.conf.statics && statement instanceof Statements.StaticBegin) {
        isStaticsBlock = true;
        message = "STATICS";
      } else if (this.conf.statics && statement instanceof Statements.StaticEnd) {
        isStaticsBlock = false;
      } else if (this.conf.testSeams && statement instanceof Statements.TestSeam) {
        message = "TEST-SEAM";
      } else if (this.conf.statics && statement instanceof Statements.Static && isStaticsBlock === false) {
        message = "STATICS";
      } else if (this.conf.break && statement instanceof Statements.Break) {
        message = "BREAK/BREAK-POINT";
        fix = this.conf.skipQuickFix === true ? undefined : EditHelper.deleteStatement(file, statementNode);
      }

      if (message) {
        issues.push(Issue.atStatement(file, statementNode, this.getDescription(message), this.getMetadata().key, this.conf.severity, fix));
      }

      if (this.conf.defaultKey
          && (this.reg.getConfig().getVersion() >= Version.v740sp02
          || this.reg.getConfig().getVersion() === Version.Cloud)
          && (statement instanceof Statements.Data || statement instanceof Statements.Type)) {
        const tt = statementNode.findFirstExpression(TypeTable)?.findDirectExpression(TypeTableKey);
        const token = tt?.findDirectTokenByText("DEFAULT");
        if (tt && token) {
          message = "DEFAULT KEY";
          issues.push(Issue.atToken(file, token, this.getDescription(message), this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return issues;
  }

  private getDescribeLinesFix(file: ABAPFile, statementNode: StatementNode): IEdit|undefined {
    const children = statementNode.getChildren();
    const target = children[4].concatTokens();
    const source = children[2].concatTokens();

    const startPosition = children[0].getFirstToken().getStart();
    const insertText = target + " = lines( " + source + " ).";

    const deleteFix = EditHelper.deleteStatement(file, statementNode);
    const insertFix = EditHelper.insertAt(file, startPosition, insertText);

    const finalFix = EditHelper.merge(deleteFix, insertFix);

    return finalFix;
  }
}
