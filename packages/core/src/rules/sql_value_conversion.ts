import {Issue} from "../issue";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Interface} from "../objects";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";

export class SQLValueConversionConf extends BasicRuleConfig {
}

export class SQLValueConversion implements IRule {
  private conf = new SQLValueConversionConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "sql_value_conversion",
      title: "Implicit SQL Value Conversion",
      shortDescription: `Ensure types match when selecting from database`,
      extendedInformation: `
* Integer to CHAR conversion
* Integer to NUMC conversion
* NUMC to Integer conversion
* CHAR to Integer conversion
* Source field longer than database field, CHAR -> CHAR
* Source field longer than database field, NUMC -> NUMC`,
      tags: [],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SQLValueConversionConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {

    if (!(obj instanceof ABAPObject) || obj instanceof Interface) {
      return [];
    }

    // messages defined in sql_compare.ts

    const issues = this.traverse(new SyntaxLogic(this.reg, obj).run().spaghetti.getTop());

    return issues;
  }

  private traverse(node: ISpaghettiScopeNode): Issue[] {
    const ret: Issue[] = [];

    for (const r of node.getData().sqlConversion) {
      const file = this.reg.getFileByName(node.getIdentifier().filename);
      if (file === undefined) {
        continue;
      }
      ret.push(Issue.atToken(file, r.token, r.message, this.getMetadata().key, this.getConfig().severity));
    }

    for (const c of node.getChildren()) {
      ret.push(...this.traverse(c));
    }

    return ret;
  }

}