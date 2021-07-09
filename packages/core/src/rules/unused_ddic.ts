import {IRule, IRuleMetadata} from "./_irule";
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
      extendedInformation: `Objects checked: DOMA + DTEL`,
      tags: [],
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
    if (obj instanceof Objects.Domain
        || obj instanceof Objects.TableType
        || obj instanceof Objects.View
        || obj instanceof Objects.Table
        || obj instanceof Objects.DataElement) {
      return this.check(obj);
    }

    return [];
  }

  private check(obj: IObject): Issue[] {
    const id = obj.getIdentifier();
    const refs = this.reg.getDDICReferences();
    const list = refs.listWhereUsed(obj);

    if (id && list.length === 0) {
      const message = obj.getType() + " " + obj.getName() + " not statically referenced";
      return [Issue.atIdentifier(id, message, this.getMetadata().key, this.conf.severity)];
    }

    return [];
  }

}