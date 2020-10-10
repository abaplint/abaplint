import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ExpressionNode, TokenNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";

export class ManyParenthesisConf extends BasicRuleConfig {
}

export class ManyParenthesis extends ABAPRule {

  private conf = new ManyParenthesisConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "many_parenthesis",
      title: "Too many parenthesis",
      shortDescription: `Searches for expressions where extra parenthesis can safely be removed`,
      tags: [RuleTag.SingleFile],
      badExample: `
IF ( destination IS INITIAL ).
ENDIF.
IF foo = boo AND ( bar = lar AND moo = loo ).
ENDIF.
`,
      goodExample: `
IF destination IS INITIAL.
ENDIF.
IF foo = boo AND bar = lar AND moo = loo.
ENDIF.
`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ManyParenthesisConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    for (const cond of structure.findAllExpressions(Expressions.Cond)) {
      issues = issues.concat(this.analyze(file, cond));
    }

    for (const sub of structure.findAllExpressions(Expressions.CondSub)) {
      const cond = sub.findDirectExpressions(Expressions.Cond);
      if (cond.length !== 1) {
        continue;
      }
      if (cond[0].getChildren().length === 1) {
        const message = "Too many parenthesis, simple";
        const issue = Issue.atToken(file, sub.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

////////////////////

  private analyze(file: ABAPFile, cond: ExpressionNode): Issue[] {
    const issues: Issue[] = [];
    let comparator = "";

    for (const c of cond.getChildren()) {
      let current = "";
      if (c instanceof TokenNode) {
        current = c.get().getStr().toUpperCase();
      } else if (c instanceof ExpressionNode && c.get() instanceof Expressions.CondSub) {
        if (c.getFirstToken().getStr() === "NOT") {
          return [];
        }
        const i = c.findDirectExpression(Expressions.Cond);
        if (i === undefined) {
          return [];
        }
        current = this.findComparator(i);
      }
      if (comparator === "") {
        comparator = current;
      } else if (comparator !== current) {
        return [];
      }
    }

    if (comparator !== "" && comparator !== "MIXED") {
      const message = "Too many parenthesis, complex";
      const issue = Issue.atToken(file, cond.getFirstToken(), message, this.getMetadata().key, this.conf.severity);
      issues.push(issue);
    }

    return issues;
  }

  private findComparator(cond: ExpressionNode): string {
    let comparator = "";

    const children = cond.getChildren();
    for (const c of children) {
      if (c instanceof TokenNode) {
        const current = c.get().getStr().toUpperCase();
        if (comparator === "") {
          comparator = current;
        } else if (current !== comparator) {
          return "MIXED";
        }
      }
    }

    return comparator;
  }

}