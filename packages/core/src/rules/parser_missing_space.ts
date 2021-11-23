import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ExpressionNode, StatementNode, TokenNode} from "../abap/nodes";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag, IRuleMetadata} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

// todo: this rule needs refactoring

export class ParserMissingSpaceConf extends BasicRuleConfig {
}

export class ParserMissingSpace extends ABAPRule {
  private conf = new ParserMissingSpaceConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "parser_missing_space",
      title: "Parser Error, missing space",
      shortDescription: `In special cases the ABAP language allows for not having spaces before or after string literals.
This rule makes sure the spaces are consistently required across the language.`,
      tags: [RuleTag.Syntax, RuleTag.Whitespace, RuleTag.SingleFile],
      badExample: `IF ( foo = 'bar').`,
      goodExample: `IF ( foo = 'bar' ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ParserMissingSpaceConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let start = new Position(0, 0);
    for (const statement of file.getStatements()) {
      const missing = this.missingSpace(statement);
      if (missing) {
        const message = "Missing space between string or character literal and parentheses";
        start = missing;
        const issue = Issue.atPosition(file, start, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

  private missingSpace(statement: StatementNode): Position | undefined {

    const found = statement.findAllExpressionsMulti([Expressions.CondSub, Expressions.SQLCond,
      Expressions.ValueBody, Expressions.NewObject, Expressions.Cond,
      Expressions.ComponentCond, Expressions.MethodCallParam], true);
    let pos: Position | undefined = undefined;
    for (const f of found) {
      const type = f.get();
      if (type instanceof Expressions.CondSub) {
        pos = this.checkCondSub(f);
      } else if (type instanceof Expressions.ValueBody) {
        pos = this.checkValueBody(f);
      } else if (type instanceof Expressions.Cond) {
        pos = this.checkCond(f);
      } else if (type instanceof Expressions.ComponentCond) {
        pos = this.checkComponentCond(f);
      } else if (type instanceof Expressions.SQLCond) {
        pos = this.checkSQLCond(f);
      } else if (type instanceof Expressions.NewObject) {
        pos = this.checkNewObject(f);
      } else if (type instanceof Expressions.MethodCallParam) {
        pos = this.checkMethodCallParam(f);
      }

      if (pos) {
        return pos;
      }
    }

    return undefined;
  }

  private checkSQLCond(cond: ExpressionNode): Position | undefined {
    const children = cond.getChildren();
    for (let i = 0; i < children.length; i++) {
      if (children[i].get() instanceof Expressions.SQLCond) {
        const current = children[i];
        const prev = children[i - 1].getLastToken();
        const next = children[i + 1].getFirstToken();

        if (prev.getStr() === "("
            && prev.getRow() === current.getFirstToken().getRow()
            && prev.getCol() + 1 === current.getFirstToken().getStart().getCol()) {
          return current.getFirstToken().getStart();
        }

        if (next.getStr() === ")"
            && next.getRow() === current.getLastToken().getRow()
            && next.getCol() === current.getLastToken().getEnd().getCol()) {
          return current.getLastToken().getEnd();
        }
      }
    }
    return undefined;
  }

  private checkNewObject(cond: ExpressionNode): Position | undefined {
    const children = cond.getChildren();

    {
      const first = children[children.length - 2].getLastToken();
      const second = children[children.length - 1].getFirstToken();
      if (first.getRow() === second.getRow()
          && first.getEnd().getCol() === second.getStart().getCol()) {
        return second.getStart();
      }
    }

    return undefined;
  }

  private checkCondSub(cond: ExpressionNode): Position | undefined {
    const children = cond.getChildren();
    for (let i = 0; i < children.length; i++) {
      if (children[i].get() instanceof Expressions.Cond) {
        const current = children[i];
        const prev = children[i - 1].getLastToken();
        const next = children[i + 1].getFirstToken();

        if (prev.getStr() === "("
            && prev.getRow() === current.getFirstToken().getRow()
            && prev.getCol() + 1 === current.getFirstToken().getStart().getCol()) {
          return current.getFirstToken().getStart();
        }

        if (next.getStr() === ")"
            && next.getRow() === current.getLastToken().getRow()
            && next.getCol() === current.getLastToken().getEnd().getCol()) {
          return current.getLastToken().getEnd();
        }

      }
    }
    return undefined;
  }

  private checkComponentCond(cond: ExpressionNode): Position | undefined {
    const children = cond.getChildren();
    for (let i = 0; i < children.length; i++) {
      if (children[i].get() instanceof Expressions.ComponentCond) {
        const current = children[i];
        const prev = children[i - 1].getLastToken();
        const next = children[i + 1].getFirstToken();

        if (prev.getStr() === "("
            && prev.getRow() === current.getFirstToken().getRow()
            && prev.getCol() + 1 === current.getFirstToken().getStart().getCol()) {
          return current.getFirstToken().getStart();
        }

        if (next.getStr() === ")"
            && next.getRow() === current.getLastToken().getRow()
            && next.getCol() === current.getLastToken().getEnd().getCol()) {
          return current.getLastToken().getEnd();
        }

      }
    }
    return undefined;
  }

  private checkValueBody(vb: ExpressionNode): Position | undefined {
    const children = vb.getChildren();
    for (let i = 0; i < children.length; i++) {
      const current = children[i];

      if (current instanceof TokenNode) {
        const prev = children[i - 1]?.getLastToken();
        const next = children[i + 1]?.getFirstToken();

        if (current.getFirstToken().getStr() === "("
            && next
            && next.getRow() === current.getLastToken().getRow()
            && next.getCol() === current.getLastToken().getEnd().getCol()) {
          return current.getFirstToken().getStart();
        }

        if (current.getFirstToken().getStr() === ")"
            && prev
            && prev.getRow() === current.getFirstToken().getRow()
            && prev.getEnd().getCol() === current.getFirstToken().getStart().getCol()) {
          return current.getLastToken().getEnd();
        }

      }
    }
    return undefined;
  }

  private checkCond(cond: ExpressionNode): Position | undefined {
    const children = cond.getAllTokens();
    for (let i = 0; i < children.length - 1; i++) {
      const current = children[i];
      const next = children[i + 1];

      if (next.getStr().startsWith("'")
          && next.getRow() === current.getRow()
          && next.getCol() === current.getEnd().getCol()) {
        return current.getEnd();
      }
    }

    return undefined;
  }

  private checkMethodCallParam(call: ExpressionNode): Position | undefined {
    const children = call.getChildren();

    {
      const first = children[0].getFirstToken();
      const second = children[1].getFirstToken();
      if (first.getRow() === second.getRow()
          && first.getCol() + 1 === second.getStart().getCol()) {
        return second.getStart();
      }
    }

    {
      const first = children[children.length - 2].getLastToken();
      const second = children[children.length - 1].getFirstToken();
      if (first.getRow() === second.getRow()
          && first.getEnd().getCol() === second.getStart().getCol()) {
        return second.getStart();
      }
    }

    return undefined;
  }

}