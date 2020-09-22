import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata} from "./_irule";
import {ExpressionNode} from "../abap/nodes";

export class ManyParenthesisConf extends BasicRuleConfig {
}

export class ManyParenthesis extends ABAPRule {

  private conf = new ManyParenthesisConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "many_parenthesis",
      title: "Too many parenthesis",
      shortDescription: `Searches for expressions where extra parenthesis can safely be removed`,
      tags: [],
      badExample: `IF ( destination IS INITIAL ).`,
      goodExample: `IF destination IS INITIAL.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ManyParenthesisConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    for (const sub of structure.findAllExpressions(Expressions.CondSub)) {
      for (const cond of sub.findDirectExpressions(Expressions.Cond)) {
        if (this.isSimple(cond) === true) {
          const message = "Too many parenthesis";
          const issue = Issue.atToken(file, sub.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
          issues.push(issue);
        }
      }
    }

    return issues;
  }

////////////////////

  private isSimple(cond: ExpressionNode): boolean {
    const children = cond.getChildren();
    if (children.length === 1 && children[0].get() instanceof Expressions.Compare) {
      return true;
    }
    return false;
  }

}