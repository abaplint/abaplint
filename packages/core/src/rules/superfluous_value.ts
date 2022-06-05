import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Version} from "../version";
import {ABAPFile} from "../abap/abap_file";

export class SuperfluousValueConf extends BasicRuleConfig {
}

export class SuperfluousValue extends ABAPRule {
  private conf = new SuperfluousValueConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "superfluous_value",
      title: "Superfluous VALUE",
      shortDescription: `Find superfluous VALUE expressions`,
      extendedInformation: `Left hand side is inline, VALUE is inferred, value body is simple, from v740sp02 and up`,
      tags: [RuleTag.SingleFile],
      badExample: `DATA(message_entry) = VALUE #( message_table[ msgno = msgno ] ).`,
      goodExample: `DATA(message_entry) = message_table[ msgno = msgno ].`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SuperfluousValueConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    if (this.reg.getConfig().getVersion() < Version.v740sp02
        && this.reg.getConfig().getVersion() !== Version.Cloud) {
      return [];
    }

    const struc = file.getStructure();
    if (struc === undefined) {
      return []; // syntax error
    }

    for (const m of struc.findAllStatements(Statements.Move)) {
      if (m.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.InlineData) === undefined) {
        continue;
      }

      const source = m.findDirectExpression(Expressions.Source);
      if (source === undefined) {
        continue;
      }

      const type = source.findDirectExpression(Expressions.TypeNameOrInfer)?.concatTokens();
      if (type !== "#") {
        continue;
      }

      const body = source.findDirectExpression(Expressions.ValueBody);
      if (body === undefined) {
        continue;
      }

      if (body.getChildren().length === 1) {
        const message = "Superfluous VALUE expression";
        const issue = Issue.atStatement(file, m, message, this.getMetadata().key, this.conf.severity);
        output.push(issue);
      }
    }

    return output;
  }

}