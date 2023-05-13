import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPObject} from "../objects/_abap_object";
import {Interface} from "../objects";

export class EasyToFindMessagesConf extends BasicRuleConfig {
}

export class EasyToFindMessages implements IRule {
  private conf = new EasyToFindMessagesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "easy_to_find_messages",
      title: "Easy to find messages",
      shortDescription: `Make messages easy to find`,
      extendedInformation: `All messages must be statically referenced exactly once

Also see rule "message_exists"

https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#make-messages-easy-to-find`,
      tags: [RuleTag.Styleguide],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: EasyToFindMessagesConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(object: IObject): Issue[] {
    const issues: Issue[] = [];

    if (object.getType() === "MSAG") {
// todo
      return [];
    } else if (object instanceof ABAPObject) {
      if (object instanceof Interface) {
        return [];
      }
// todo
      return [];
    }

    return issues;
  }

}