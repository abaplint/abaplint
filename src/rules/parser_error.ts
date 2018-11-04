import {Issue} from "../issue";
import Position from "../position";
import * as Tokens from "../abap/tokens";
import {Unknown, Statement} from "../abap/statements/_statement";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";

export class ParserErrorConf {
  public enabled: boolean = true;
}

export class ParserError extends ABAPRule {

  private conf = new ParserErrorConf();

  public getKey(): string {
    return "parser_error";
  }

  public getDescription(): string {
    return "Parser error(Unknown statement)";
  }

  public getMessage(num: number): string {
    switch (num) {
      case 1:
        return this.getDescription();
      case 2:
        return "Missing space between string or character literal and parentheses";
      default:
        throw new Error();
    }
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ParserErrorConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    let issues: Array<Issue> = [];

    let start = new Position(0, 0);
    for (let statement of file.getStatements()) {
// only report one error per row
      if (statement instanceof Unknown
            && start.getRow() !== statement.getStart().getRow()) {

        let message = this.missingSpace(statement) ? 2 : 1;

        start = statement.getStart();
        let issue = new Issue({rule: this, file, message, start});
        issues.push(issue);
      }
    }

    return issues;
  }

  private missingSpace(statement: Statement): boolean {
    const tokens = statement.getTokens();
    for (let i = 0; i < tokens.length - 1; i++) {
      const current = tokens[ i ];
      const next = tokens[ i + 1 ];
      if (current.getRow() === next.getRow() &&
          current.getCol() + current.getStr().length === next.getCol() &&
          (current instanceof Tokens.String && next.getStr() === ")"
          || current.getStr() === "(" && next instanceof Tokens.String)) {
        return true;
      }
    }

    return false;
  }

}