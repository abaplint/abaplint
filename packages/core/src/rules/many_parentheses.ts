import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ExpressionNode, TokenNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {EditHelper} from "../edit_helper";

export class ManyParenthesesConf extends BasicRuleConfig {
}

export class ManyParentheses extends ABAPRule {

  private conf = new ManyParenthesesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "many_parentheses",
      title: "Too many parentheses",
      shortDescription: `Searches for expressions where extra parentheses can safely be removed`,
      tags: [RuleTag.SingleFile, RuleTag.Quickfix],
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

  public setConfig(conf: ManyParenthesesConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const structure = file.getStructure();
    if (structure === undefined) {
      return [];
    }

    for (const cond of structure.findAllExpressions(Expressions.Cond)) {
      issues.push(...this.analyze(file, cond));
    }

    for (const sub of structure.findAllExpressions(Expressions.CondSub)) {
      const cond = sub.findDirectExpressions(Expressions.Cond);
      if (cond.length !== 1) {
        continue;
      }
      if (cond[0].getChildren().length === 1) {
        const message = "Too many parentheses, simple";
        const fixText = sub.getChildren()[1].concatTokens();
        const fix = EditHelper.replaceRange(file, sub.getFirstToken().getStart(), sub.getLastToken().getEnd(), fixText);

        const issue = Issue.atToken(file, sub.getFirstToken(), message, this.getMetadata().key, this.conf.severity, fix);
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
      const message = "Too many parentheses, complex";
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