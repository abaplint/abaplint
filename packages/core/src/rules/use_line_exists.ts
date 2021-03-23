import {Issue} from "../issue";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Version} from "../version";
import {IRuleMetadata, RuleTag} from "./_irule";
import {StatementNode} from "../abap/nodes";
import {Comment} from "../abap/2_statements/statements/_statement";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";

export class UseLineExistsConf extends BasicRuleConfig {
}

export class UseLineExists extends ABAPRule {
  private conf = new UseLineExistsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_line_exists",
      title: "Use line_exists",
      shortDescription: `Use line_exists, from 740sp02 and up`,
      extendedInformation: `
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-line_exists-to-read-table-or-loop-at

`,
      tags: [RuleTag.Upport, RuleTag.Styleguide, RuleTag.SingleFile],
      badExample: `READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
IF sy-subrc = 0.
ENDIF.`,
      goodExample: `IF line_exists( my_table[ key = 'A' ] ).
ENDIF.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseLineExistsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const issues: Issue[] = [];

    if (obj.getType() === "INTF") {
      return [];
    }

    if (this.reg.getConfig().getVersion() < Version.v740sp02 && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    const statements = file.getStatements();
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.get() instanceof Statements.ReadTable
          && statement.concatTokens().toUpperCase().includes("TRANSPORTING NO FIELDS")
          && this.checksSubrc(i, statements) === true
          && this.usesTabix(i, statements) === false) {
        issues.push(Issue.atStatement(file, statement, "Use line_exists", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

///////////////////////

  private checksSubrc(index: number, statements: readonly StatementNode[]): boolean {
    for (let i = index + 1; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.get() instanceof Comment) {
        continue;
      }
      for (const c of statement.findAllExpressions(Expressions.Cond)) {
        for (const s of c.findAllExpressions(Expressions.Source)) {
          if (s.concatTokens().toUpperCase() === "SY-SUBRC") {
            return true;
          }
        }
      }
      return false;
    }
    return false;
  }

  // this is a heuristic, data flow analysis is required to get the correct result
  private usesTabix(index: number, statements: readonly StatementNode[]): boolean {
    for (let i = index + 1; i < index + 5; i++) {
      const statement = statements[i];
      if (statement === undefined) {
        break;
      } else if (statement.get() instanceof Comment) {
        continue;
      } else if (statement.concatTokens().toUpperCase().includes(" SY-TABIX")) {
        return true;
      }
    }
    return false;
  }

}