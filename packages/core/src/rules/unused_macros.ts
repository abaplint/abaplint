import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRegistry} from "../_iregistry";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";

export class UnusedMacrosConf extends BasicRuleConfig {
  /** skip specific names, case insensitive
   * @uniqueItems true
   */
  public skipNames?: string[] = [];
}

export class UnusedMacros implements IRule {
  private conf = new UnusedMacrosConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_macros",
      title: "Unused macros",
      shortDescription: `Checks for unused macro definitions definitions`,
      tags: [RuleTag.Quickfix],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedMacrosConf) {
    this.conf = conf;
    if (this.conf.skipNames === undefined) {
      this.conf.skipNames = [];
    }
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

// todo

    return [];
  }

}