import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";

export class SelectPerformanceConf extends BasicRuleConfig {
  /** Detects ENDSELECT */
  public endSelect: boolean = true;
  /** Detects SELECT * */
  public selectStar: boolean = true;
  /** SELECT * is considered okay if the table is less than X columns, the table must be known to the linter */
  public starOkayIfFewColumns: number = 10;
}

export class SelectPerformance implements IRule {
  protected reg: IRegistry;
  private conf = new SelectPerformanceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_performance",
      title: "SELECT performance",
      shortDescription: `Various checks regarding SELECT performance.`,
      extendedInformation: `ENDSELECT: not reported when the corresponding SELECT has PACKAGE SIZE

SELECT *: not reported if using INTO/APPENDING CORRESPONDING FIELDS OF`,
      tags: [RuleTag.SingleFile, RuleTag.Performance],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectPerformanceConf): void {
    this.conf = conf;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const issues: Issue[] = [];

    for (const file of obj.getABAPFiles()) {

      const stru = file.getStructure();
      if (stru === undefined) {
        return issues;
      }

//      new SyntaxLogic(this.reg, obj).run().spaghetti.getTop()

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
            && concat.startsWith("SELECT SINGLE * ") === false) {
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
    }

    return issues;
  }

}