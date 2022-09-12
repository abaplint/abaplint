import {Issue} from "../issue";
import {IRule, IRuleMetadata} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {FunctionGroup} from "../objects";

export class IdenticalDescriptionsConf extends BasicRuleConfig {
}

export class IdenticalDescriptions implements IRule {
  private conf = new IdenticalDescriptionsConf();
  private descriptions: {[type: string]: {[description: string]: string[]}};
  private types: string[];

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_descriptions",
      title: "Identical descriptions",
      shortDescription: `Searches for objects with the same type and same description`,
      extendedInformation: `Case insensitive

Only checks the master language descriptions

Dependencies are skipped

Works for: INTF, CLAS, DOMA, DTEL, FUNC in same FUGR`,
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
    this.types = ["INTF", "CLAS", "DOMA", "DTEL"];
    for (const o of reg.getObjects()) {
      if (reg.isDependency(o)) {
        continue;
      }
      const type = o.getType();
      if (this.types.includes(type)) {
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
    const type = o.getType();
    if (this.types.includes(type)) {
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

    if (o instanceof FunctionGroup) {
      issues.push(...this.checkFunctionModules(o));
    }

    return issues;
  }

  private checkFunctionModules(fugr: FunctionGroup): Issue[] {
    const descriptions: {[type: string]: boolean} = {};
    for (const fm of fugr.getModules()) {
      const d = fm.getDescription()?.toUpperCase();
      if (d === undefined || d === "") {
        continue;
      }
      if (descriptions[d] !== undefined) {
        const message = "FUGR " + fugr.getName() + " contains function modules with identical descriptions";
        return [Issue.atRow(fugr.getXMLFile()!, 1, message, this.getMetadata().key, this.getConfig().severity)];
      }
      descriptions[d] = true;
    }
    return [];
  }

}