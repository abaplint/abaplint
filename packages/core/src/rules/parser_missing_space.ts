import * as Expressions from "../abap/2_statements/expressions";
import {Issue} from "../issue";
import {Position} from "../position";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode} from "../abap/nodes";
import {BasicRuleConfig} from "./_basic_rule_config";
import {RuleTag, IRuleMetadata} from "./_irule";

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
      tags: [RuleTag.Syntax],
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

    const conds = statement.findAllExpressions(Expressions.CondSub);
    for (const cond of conds) {
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
    }

    const calls = statement.findAllExpressions(Expressions.MethodCallParam);
    for (const call of calls) {
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
    }

    return undefined;
  }

}