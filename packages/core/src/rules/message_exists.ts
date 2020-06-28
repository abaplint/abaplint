import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {MessageClass} from "../objects";

export class MessageExistsConf extends BasicRuleConfig {
}

export class MessageExistsRule extends ABAPRule {
  private conf = new MessageExistsConf();

  public getMetadata() {
    return {
      key: "message_exists",
      title: "Check MESSAGE exists",
      shortDescription: `In message statements, check that the message class + id exist`,
    };
  }

  private getDescription(reason: string): string {
    return "Message invalid: " + reason;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MessageExistsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    for (const node of struc.findAllExpressions(Expressions.MessageClass)) {
      const token = node.getFirstToken();
      if (this.reg.getObject("MSAG", token.getStr()) === undefined) {
        const message = this.getDescription("Message class \"" + token.getStr() + "\" not found");
        const issue = Issue.atToken(file, token, message, this.getMetadata().key);
        issues.push(issue);
      }
    }

    for (const node of struc.findAllExpressions(Expressions.MessageSource)) {
      const clas = node.findFirstExpression(Expressions.MessageClass);
      if (clas === undefined) {
// todo, handle case where message class is defined on header level instead of in the statement
        continue;
      }
      const name = clas.getFirstToken().getStr();
      const msag = this.reg.getObject("MSAG", name) as MessageClass;
      if (msag === undefined) {
        continue; // issue is issued above
      }
      const typeNumber = node.findFirstExpression(Expressions.MessageTypeAndNumber);
      if (typeNumber === undefined) {
        continue;
      }
      const numberToken = typeNumber.getFirstToken();
      const num = numberToken.getStr().substr(1);
      if (msag.getByNumber(num) === undefined) {
        const message = this.getDescription("Message number \"" + num + "\" not found in class \"" + name + "\"");
        const issue = Issue.atToken(file, numberToken, message, this.getMetadata().key);
        issues.push(issue);
      }
    }

// todo, check number of placeholders in message vs code matches

    return issues;
  }
}