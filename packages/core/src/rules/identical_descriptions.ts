import {Issue} from "../issue";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import * as Objects from "../objects";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";

export class IdenticalDescriptionsConf extends BasicRuleConfig {
}

export class IdenticalDescriptions implements IRule {
  private conf = new IdenticalDescriptionsConf();
  private descriptions: {[type: string]: {[description: string]: string[]}};

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_descriptions",
      title: "Identical descriptions",
      shortDescription: `Searches for objects with the same type and same description, case insensitive`,
      extendedInformation: `Only works for interfaces and classes`,
      tags: [],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalDescriptionsConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.descriptions = {};
    for (const o of reg.getObjects()) {
      if (o instanceof Objects.Interface || o instanceof Objects.Class) {
        const type = o.getType();
        const description = o.getDescription()?.toUpperCase();
        if (description === undefined || description === "") {
          continue;
        }
        if (this.descriptions[type] === undefined) {
          this.descriptions[type] = {};
        }
        if (this.descriptions[type][description] === undefined) {
          this.descriptions[type][description] = [];
        }
        this.descriptions[type][description].push(o.getName());
      }
    }
    return this;
  }

  public run(o: IObject): Issue[] {
    const issues: Issue[] = [];
    if (o instanceof Objects.Interface || o instanceof Objects.Class) {
      const type = o.getType();
      const description = o.getDescription()?.toUpperCase();
      if (description === undefined || description === "") {
        return issues;
      }

      const found = this.descriptions[type][description].filter(a => a !== o.getName());
      if (found.length > 0) {
        const message = "Identical description: " + found[0];
        issues.push(Issue.atRow(o.getXMLFile()!, 1, message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

}