import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IMSAGReferences} from "../_imsag_references";
import {Position} from "../position";
import {MessageClass} from "../objects";
import {buildMessageReferences} from "./_message_references";

export class EasyToFindMessagesConf extends BasicRuleConfig {
}

export class EasyToFindMessages implements IRule {
  private conf = new EasyToFindMessagesConf();
  private msagReferences: IMSAGReferences;

  public getMetadata(): IRuleMetadata {
    return {
      key: "easy_to_find_messages",
      title: "Easy to find messages",
      shortDescription: `Make messages easy to find`,
      extendedInformation: `All messages must be statically referenced exactly once

Only MESSAGE and RAISE statments are counted as static references

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

  public initialize(reg: IRegistry): IRule {
    this.msagReferences = reg.getMSAGReferences();

    // only message classes outside dependencies are checked, so a dependency can only contribute
    // references if its source mentions one of their names
    const names: string[] = [];
    for (const obj of reg.getObjectsByType("MSAG")) {
      if (reg.isDependency(obj) === false) {
        names.push(obj.getName().replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"));
      }
    }
    const mentions = names.length > 0 ? new RegExp(names.join("|"), "i") : undefined;

    // the SyntaxLogic builds the references
    buildMessageReferences(reg, mentions === undefined
      ? undefined
      : obj => obj.getABAPFiles().some(f => mentions.test(f.getRaw())));

    return this;
  }

  public run(object: IObject): Issue[] {
    const issues: Issue[] = [];

    if (object.getType() === "MSAG") {
      const msag = object as MessageClass;
      for (const message of msag.getMessages()) {
        const where = this.msagReferences.listByMessage(msag.getName().toUpperCase(), message.getNumber());
        if (where.length === 0) {
          const text = `Message ${message.getNumber()} not statically referenced`;
          const position = new Position(1, 1);
          const issue = Issue.atPosition(object.getFiles()[0], position, text, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        } else if (where.length >= 2) {
          const text = `Message ${message.getNumber()} referenced more than once`;
          const position = new Position(1, 1);
          const issue = Issue.atPosition(object.getFiles()[0], position, text, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }

    return issues;
  }

}