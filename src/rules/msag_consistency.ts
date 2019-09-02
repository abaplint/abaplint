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

  public getDescription(): string {
    return "Message class consistency";
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
        issues.push(new Issue({file: obj.getFiles()[0],
          message: "Message number must be 3 digits, " + message.getNumber(), key: this.getKey(), start: new Position(1, 1)}));
      }
      if (message.getMessage() === "") {
        issues.push(new Issue({file: obj.getFiles()[0],
          message: "Message text empty, " + message.getNumber(), key: this.getKey(), start: new Position(1, 1)}));
      }
    }

    return issues;
  }
}