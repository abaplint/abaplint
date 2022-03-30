import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {Issue} from "../issue";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";

export class NROBConsistencyConf extends BasicRuleConfig {
}

export class NROBConsistency implements IRule {
  private reg: IRegistry;
  private conf = new NROBConsistencyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "nrob_consistency",
      title: "Number range consistency",
      shortDescription: `Consistency checks for number ranges`,
      extendedInformation: `Issue reported if percentage warning is over 50%

Issue reported if the referenced domain is not found(taking error namespace into account)`,
      tags: [RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: NROBConsistencyConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof Objects.NumberRange)) {
      return [];
    }
    const issues: Issue[] = [];
    const id = obj.getIdentifier();
    if (id === undefined) {
      return [];
    }

    if (obj.getPercentage() || 0 > 50) {
      const message = "Percentage more than 50";
      issues.push(Issue.atIdentifier(id, message, this.getMetadata().key, this.getConfig().severity));
    }

    const domain = obj.getDomain();
    if (domain
        && this.reg.getObject("DOMA", domain) === undefined
        && this.reg.inErrorNamespace(domain) === true) {
      const message = "Domain " + domain + " not found";
      issues.push(Issue.atIdentifier(id, message, this.getMetadata().key, this.getConfig().severity));
    }

    return [];
  }

}