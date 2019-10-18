import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {MessageClass} from "../objects";
import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {Position} from "../position";

/** Checks the validity of messages in message classes */
export class MSAGConsistencyConf extends BasicRuleConfig {
}

export class MSAGConsistency implements IRule {
  private conf = new MSAGConsistencyConf();

  public getKey(): string {
    return "msag_consistency";
  }

  private getDescription(reason: string): string {
    return "Message class invalid: " + reason;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MSAGConsistencyConf) {
    this.conf = conf;
  }

  public run(obj: IObject, _reg: Registry): Issue[] {
    const issues: Issue[] = [];

    if (!(obj instanceof MessageClass)) {
      return [];
    }

    for (const message of obj.getMessages()) {
// todo, get the right positions in xml file
      if (!message.getNumber().match(/\d\d\d/)) {
        const text = this.getDescription("Message number must be 3 digits: message " + message.getNumber());
        const position = new Position(1, 1);
        const issue = Issue.atPosition(obj.getFiles()[0], position, text, this.getKey());
        issues.push(issue);
      }
      if (message.getMessage() === "") {
        const text = "Message text empty: message " + message.getNumber();
        const position = new Position(1, 1);
        const issue = Issue.atPosition(obj.getFiles()[0], position, text, this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}