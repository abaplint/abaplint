import * as Expressions from "../abap/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "../registry";
import {MessageClass} from "../objects";

export class MessageConf extends BasicRuleConfig {
}

export class MessageRule extends ABAPRule {
  private conf = new MessageConf();

  public getKey(): string {
    return "message";
  }

  public getDescription(): string {
    return "Message checks";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: MessageConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    for (const node of struc.findAllExpressions(Expressions.MessageClass)) {
      const token = node.getFirstToken();
      if (reg.getObject("MSAG", token.getStr()) === undefined) {
        const message = "Message class \"" + token.getStr() + "\" not found";
        issues.push(new Issue({file, message, code: this.getKey(), start: token.getPos()}));
      }
    }

    for (const node of struc.findAllExpressions(Expressions.MessageSource)) {
      const clas = node.findFirstExpression(Expressions.MessageClass);
      if (clas === undefined) {
// todo, handle case where message class is defined on header level instead of in the statement
        continue;
      }
      const name = clas.getFirstToken().getStr();
      const msag = reg.getObject("MSAG", name) as MessageClass;
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
        const message = "Message number \"" + num + "\" not found in class \"" + name + "\"";
        issues.push(new Issue({file, message, code: this.getKey(), start: numberToken.getPos()}));
      }
    }

// todo, check number of placeholders in message vs code matches

    return issues;
  }
}