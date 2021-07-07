import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {Issue} from "../issue";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";

export class UnusedDDICConf extends BasicRuleConfig {
}

export class UnusedDDIC implements IRule {
  private reg: IRegistry;
  private conf = new UnusedDDICConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "unused_ddic",
      title: "Unused DDIC",
      shortDescription: `Checks the usage of DDIC objects`,
      extendedInformation: `todo`,
      tags: [RuleTag.Syntax],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UnusedDDICConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (obj instanceof Objects.DataElement
        || obj instanceof Objects.Domain
        || obj instanceof Objects.Table
        || obj instanceof Objects.View
        || obj instanceof Objects.TableType) {
      return this.check(obj);
    } else {
      return [];
    }
  }

  private check(_obj: Objects.DataElement | Objects.Domain | Objects.Table | Objects.View| Objects.TableType): Issue[] {
    const ret: Issue[] = [];

    console.log(this.reg.getObjectCount());

    return ret;
  }

}