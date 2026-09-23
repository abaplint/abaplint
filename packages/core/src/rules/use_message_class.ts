import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";

export class UseMessageClassConf extends BasicRuleConfig {
}

export class UseMessageClass extends ABAPRule {

  private conf = new UseMessageClassConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "use_message_class",
      title: "Use message class",
      shortDescription: `Define messages in SE91 instead of using inline text or variables`,
      tags: [RuleTag.Styleguide, RuleTag.SingleFile],
      badExample: `MESSAGE 'Something went wrong' TYPE 'E'.`,
      goodExample: `MESSAGE e001(bc_msg).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: UseMessageClassConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _obj: ABAPObject): Issue[] {
    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    const key = this.getMetadata().key;

    for (const statement of structure.findAllStatements(Statements.Message)) {
      // The parser populates MessageSource only for the class-based forms (e001(bc_msg) or ID/TYPE/NUMBER).
      // The text form (MESSAGE <source> TYPE <source>) uses MessageSourceSource directly with no MessageSource child.
      // Absence of MessageSource is therefore a reliable discriminator between the two forms.
      if (statement.findDirectExpression(Expressions.MessageSource) !== undefined) {
        continue;
      }

      issues.push(Issue.atStatement(file, statement, "Use a message class (SE91) instead of inline text or variable", key, this.conf.severity));
    }

    return issues;
  }

}
