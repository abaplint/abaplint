import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {StructureType, TableAccessType, TableType} from "../abap/types/basic";
import {StatementNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";


export class SelectAddOrderByConf extends BasicRuleConfig {
  public skipForAllEntries: boolean = false;
}

export class SelectAddOrderBy implements IRule {
  private reg: IRegistry;
  private conf = new SelectAddOrderByConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_add_order_by",
      title: "SELECT add ORDER BY",
      shortDescription: `SELECTs add ORDER BY clause`,
      extendedInformation: `
This will make sure that the SELECT statement returns results in the same sequence on different databases

add ORDER BY PRIMARY KEY if in doubt

If the target is a sorted/hashed table, no issue is reported`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: SelectAddOrderByConf): void {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];
    if (!(obj instanceof ABAPObject) || obj.getType() === "INTF") {
      return [];
    }

    const spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;

    for (const file of obj.getABAPFiles()) {
      const stru = file.getStructure();
      if (stru === undefined) {
        return issues;
      }

      const selects = stru.findAllStatements(Statements.Select);
      selects.push(...stru.findAllStatements(Statements.SelectLoop));
      for (const s of selects) {
        const concat = s.concatTokens().toUpperCase();
        if (concat.startsWith("SELECT SINGLE ")) {
          continue;
        } else if (this.getConfig()?.skipForAllEntries === true && concat.includes(" FOR ALL ENTRIES ")) {
          continue;
        }

        // skip COUNT(*)
        const list = s.findAllExpressions(Expressions.SQLField);
        if (list.length === 1 && list[0].getFirstChild()?.get() instanceof Expressions.SQLAggregation) {
          continue;
        } else if (s.findFirstExpression(Expressions.SQLOrderBy)) {
          continue;
        }

        if (this.isTargetSortedOrHashed(s, spaghetti, file)) {
          continue;
        } else if (s.findFirstExpression(Expressions.SQLJoin) && s.findFirstExpression(Expressions.SQLForAllEntries)) {
// see https://github.com/abaplint/abaplint/issues/2957
          continue;
        }

        issues.push(Issue.atStatement(file, s, "Add ORDER BY", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  private isTargetSortedOrHashed(s: StatementNode, spaghetti: ISpaghettiScope, file: ABAPFile): boolean {
    const target = s.findFirstExpression(Expressions.SQLIntoTable)?.findFirstExpression(Expressions.Target);
    if (target) {
      const start = target.getFirstToken().getStart();
      const scope = spaghetti.lookupPosition(start, file.getFilename());
      let type = scope?.findWriteReference(start)?.getType();

      const children = target.getChildren();
      if (type instanceof StructureType && children.length >= 3 && children[1].concatTokens() === "-") {
        const found = type.getComponentByName(children[2].concatTokens());
        if (found === undefined) {
          return false;
        }
        type = found;
      }

      if (type instanceof TableType
          && (type?.getAccessType() === TableAccessType.sorted
          || type?.getAccessType() === TableAccessType.hashed)) {
        return true;
      }
    }
    return false;
  }

}