import {IRule, RuleTag} from "./_irule";
import {Issue} from "../issue";
import * as Objects from "../objects";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";

export class IndexCompletelyContainedConf extends BasicRuleConfig {
// todo, add option to not allow any void types?
}

export class IndexCompletelyContained implements IRule {
  private conf = new IndexCompletelyContainedConf();

  public getMetadata() {
    return {
      key: "index_completely_contained",
      title: "Check if database table indexes are completely contained",
      shortDescription: `If indexes are completely contained in other indexes, they can be removed to improve performance.`,
      tags: [RuleTag.Performance],
    };
  }

  public initialize() {
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IndexCompletelyContainedConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof Objects.Table)) {
      return [];
    }

// todo

    return [];
  }

}