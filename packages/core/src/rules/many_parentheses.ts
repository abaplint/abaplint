import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
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

    for (const cond of structure.findAllExpressionsMulti([Expressions.Cond, Expressions.ComponentCond])) {
      issues.push(...this.analyze(file, cond));
    }

    for (const sub of structure.findAllExpressionsMulti([Expressions.CondSub, Expressions.ComponentCondSub])) {
      let cond: readonly ExpressionNode[] = [];
      if (sub.get() instanceof Expressions.CondSub) {
        cond = sub.findDirectExpressions(Expressions.Cond);
      } else {
        cond = sub.findDirectExpressions(Expressions.ComponentCond);
      }
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

    for (const m of structure.findAllStatements(Statements.Move)) {
      issues.push(...this.analyzeMove(file, m));
    }
    for (const m of structure.findAllStatements(Statements.Select)) {
      issues.push(...this.analyzeInto(file, m));
    }

    return issues;
  }

////////////////////

  private analyzeInto(file: ABAPFile, m: StatementNode): Issue[] {
    const into = m.findFirstExpression(Expressions.SQLIntoStructure);
    if (into === undefined) {
      return [];
    }

    const second = into.getAllTokens()[1];
    if (second === undefined || second.getStr() !== "(") {
      return [];
    }

    const concat = into.concatTokens();
    if (concat.endsWith(")") === true && concat.includes(",") === false) {
      const issue = Issue.atStatement(file, m, "Too many parentheses", this.getMetadata().key, this.conf.severity);
      return [issue];
    }

    return [];
  }

  private analyzeMove(file: ABAPFile, m: StatementNode): Issue[] {
    const issues: Issue[] = [];

    const children = m.getChildren();
    const last = children[ children.length - 2];
    const lastChildren = last.getChildren();
    if (lastChildren.length === 3
        && lastChildren[0].getFirstToken().getStr() === "("
        && lastChildren[2].getFirstToken().getStr() === ")") {
      const issue = Issue.atToken(file, last.getFirstToken(), "Too many parentheses", this.getMetadata().key, this.conf.severity);
      issues.push(issue);
    }

    return issues;
  }

  private analyze(file: ABAPFile, cond: ExpressionNode): Issue[] {
    const issues: Issue[] = [];
    let comparator = "";
    let found = false;

    for (const c of cond.getChildren()) {
      let current = "";
      if (c instanceof TokenNode) {
        current = c.get().getStr().toUpperCase();
      } else if (c instanceof ExpressionNode
          && (c.get() instanceof Expressions.CondSub || c.get() instanceof Expressions.ComponentCondSub)) {
        if (c.getFirstToken().getStr().toUpperCase() === "NOT") {
          return [];
        }
        let i = c.findDirectExpression(Expressions.Cond);
        if (i === undefined) {
          i = c.findDirectExpression(Expressions.ComponentCond);
        }
        if (i === undefined) {
          return [];
        }
        current = this.findComparator(i);
        if (current !== "") {
          found = true; // dont report for the simple case that contains quick fixes
        }
      }
      if (comparator === "") {
        comparator = current;
      } else if (comparator !== "" && current !== "" && comparator !== current) {
        return [];
      }
    }

    if (comparator !== "" && comparator !== "MIXED" && found === true) {
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