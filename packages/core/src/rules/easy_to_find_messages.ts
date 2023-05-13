import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IMSAGReferences} from "../_imsag_references";
import {Position} from "../position";
import {MessageClass} from "../objects";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ABAPObject} from "../objects/_abap_object";

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

    // the SyntaxLogic builds the references
    for (const obj of reg.getObjects()) {
      if (obj instanceof ABAPObject) {
        new SyntaxLogic(reg, obj).run();
      }
    }

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