import {Issue} from "../issue";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Interface} from "../objects";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";

export class SQLValueConversionConf extends BasicRuleConfig {
}

export class SQLValueConversion implements IRule {
  private conf = new SQLValueConversionConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "sql_value_conversion",
      title: "Implicit SQL Value Conversion",
      shortDescription: `todo`,
      extendedInformation: `
NUMC: error for integer, must be exact length
CHAR: error for integer, error for too long
todo`,
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
    const issues: Issue[] = [];

    if (!(obj instanceof ABAPObject) || obj instanceof Interface) {
      return [];
    }

    new SyntaxLogic(this.reg, obj).run();
// todo

    return issues;
  }

}