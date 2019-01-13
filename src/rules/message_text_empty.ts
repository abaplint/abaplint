import {Issue} from "../issue";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {MessageClass} from "../objects";
import {Registry} from "../registry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Position} from "../position";

export class MessageTextEmptyConf extends BasicRuleConfig {
}

export class MessageTextEmpty implements IRule {

  private conf = new MessageTextEmptyConf();

  public getKey(): string {
    return "message_text_empty";
  }

  public getDescription(): string {
    return "Message text empty";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MessageTextEmptyConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    const issues: Issue[] = [];

    if (obj instanceof MessageClass) {
      for (const msg of obj.getMessages()) {
        if (msg.getMessage() === "") {
          const message = this.getDescription() + ", " + msg.getNumber();
          const issue = new Issue({file: obj.getFiles()[0], message, key: this.getKey(), start: new Position(1, 1)});
          issues.push(issue);
        }
      }
    }

    return issues;
  }


}