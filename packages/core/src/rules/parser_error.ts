import {Issue} from "../issue";
import {Position} from "../position";
import * as Tokens from "../abap/1_lexer/tokens";
import {Unknown} from "../abap/2_statements/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {StatementNode} from "../abap/nodes";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {STATEMENT_MAX_TOKENS} from "../abap/2_statements/statement_parser";
import {RuleTag} from "./_irule";

export class ParserErrorConf extends BasicRuleConfig {
}

export class ParserError extends ABAPRule {

  private conf = new ParserErrorConf();

  public getMetadata() {
    return {
      key: "parser_error",
      title: "Parser error",
      shortDescription: `Checks for syntax unrecognized by abaplint`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ParserErrorConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: IRegistry) {
    const issues: Issue[] = [];

    let start = new Position(0, 0);
    for (const statement of file.getStatements()) {
// only report one error per row
      if (statement.get() instanceof Unknown
            && start.getRow() !== statement.getStart().getRow()) {

        const missing = this.missingSpace(statement);
        if (missing) {
          const message = "Missing space between string or character literal and parentheses, Parser error";
          start = missing;
          const issue = Issue.atPosition(file, start, message, this.getMetadata().key);
          issues.push(issue);
        } else if (statement.getTokens().length > STATEMENT_MAX_TOKENS) {
          const message = "Statement too long, refactor statement";
          const issue = Issue.atToken(file, statement.getTokens()[0], message, this.getMetadata().key);
          issues.push(issue);
        } else {
          const tok = statement.getFirstToken();
          const message = "Statement does not exist in ABAP" + reg.getConfig().getVersion() + "(or a parser error), \"" + tok.getStr() + "\"";
          const issue = Issue.atStatement(file, statement, message, this.getMetadata().key);
          issues.push(issue);
        }

      }
    }

    return issues;
  }

  private missingSpace(statement: StatementNode): Position | undefined {
    const tokens = statement.getTokens();
    for (let i = 0; i < tokens.length - 1; i++) {
      const current = tokens[ i ];
      const next = tokens[ i + 1 ];
      if (current.getRow() === next.getRow() &&
          current.getCol() + current.getStr().length === next.getCol() &&
          (current instanceof Tokens.String && next.getStr() === ")"
          || current.getStr() === "(" && next instanceof Tokens.String)) {
        return next.getStart();
      }
    }

    return undefined;
  }

}