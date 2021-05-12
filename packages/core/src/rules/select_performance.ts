import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class SelectPerformanceConf extends BasicRuleConfig {
  /** Detects ENDSELECT */
  public endSelect: boolean = true;
  /** Detects SELECT * */
  public selectStar: boolean = true;
}

export class SelectPerformance extends ABAPRule {

  private conf = new SelectPerformanceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_performance",
      title: "SELECT performance",
      shortDescription: `Various checks regarding SELECT performance.`,
      extendedInformation: `
ENDSELECT: not reported when the corresponding SELECT has PACKAGE SIZE

SELECT *: not reported if using INTO/APPENDING CORRESPONDING FIELDS OF`,
      tags: [RuleTag.SingleFile, RuleTag.Performance],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectPerformanceConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues;
    }

    if (this.conf.endSelect) {
      for (const s of stru.findAllStructures(Structures.Select) || []) {
        const select = s.findDirectStatement(Statements.SelectLoop);
        if (select === undefined || select.concatTokens().includes("PACKAGE SIZE")) {
          continue;
        }
        const message = "Avoid use of ENDSELECT";
        issues.push(Issue.atStatement(file, select, message, this.getMetadata().key, this.conf.severity));
      }
    }

    if (this.conf.selectStar) {
      const selects = stru.findAllStatements(Statements.Select);
      selects.push(...stru.findAllStatements(Statements.SelectLoop));
      for (const s of selects) {
        const concat = s.concatTokens().toUpperCase();
        if (concat.startsWith("SELECT * ") === false
            && concat.startsWith("SELECT SINGLE * ") === false ) {
          continue;
        }
        if (concat.includes(" INTO CORRESPONDING FIELDS OF ")
            || concat.includes(" APPENDING CORRESPONDING FIELDS OF ")) {
          continue;
        }
        const message = "Avoid use of SELECT *";
        issues.push(Issue.atToken(file, s.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

}