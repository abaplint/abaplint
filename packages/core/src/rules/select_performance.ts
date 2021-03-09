import * as Expressions from "../abap/2_statements/expressions";
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
      shortDescription: `Various checks regarding SELECT performance.

ENDSELECT: not reported when the corresponding SELECT has PACKAGE SIZE`,
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

    if (this.conf.endSelect) {
      for (const s of file.getStructure()?.findAllStructures(Structures.Select) || []) {
        const select = s.findDirectStatement(Statements.SelectLoop);
        if (select === undefined || select.concatTokens().includes("PACKAGE SIZE")) {
          continue;
        }
        const message = "Avoid use of ENDSELECT";
        issues.push(Issue.atStatement(file, select, message, this.getMetadata().key, this.conf.severity));
      }
    }

    if (this.conf.selectStar) {
      for (const f of file.getStructure()?.findAllExpressions(Expressions.SQLFieldList) || []) {
        if (f.countTokens() === 1 && f.getFirstToken().getStr() === "*") {
          const message = "Avoid use of SELECT *";
          issues.push(Issue.atToken(file, f.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return issues;
  }

}