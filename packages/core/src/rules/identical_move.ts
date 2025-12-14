import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class IdenticalMoveConf extends BasicRuleConfig {
}

export class IdenticalMove extends ABAPRule {

  private conf = new IdenticalMoveConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "identical_move",
      title: "Identical move",
      shortDescription: `Moving the same value from left to right or right to left is redundant.`,
      tags: [RuleTag.SingleFile],
      badExample: `DATA lv_value TYPE i.
lv_value = lv_value.`,
      goodExample: `DATA lv_value TYPE i.
lv_value = 5.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: IdenticalMoveConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _obj: IObject) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      const statementType = statement.get();
      if (statementType instanceof Statements.Move) {
        const source = statement.findDirectExpression(Expressions.Source)?.concatTokens().toUpperCase();
        const target = statement.findDirectExpression(Expressions.Target)?.concatTokens().toUpperCase();
        if (source === target && source !== undefined) {
          const message = `Identical MOVE from "${source}" to "${target}"`;
          issues.push(Issue.atStatement(file, statement, message, this.getMetadata().key, this.conf.severity));
        }
      }
    }

    return issues;
  }

}