import {Issue} from "../issue";
import Position from "../position";
import * as Tokens from "../abap/tokens";
import {Unknown, Statement} from "../abap/statements/statement";
import {ABAPRule} from "./abap_rule";
import {ParsedFile} from "../files";

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

  public runParsed(file: ParsedFile) {
    let issues: Array<Issue> = [];

    let pos = new Position(0, 0);
    for (let statement of file.getStatements()) {
// only report one error per row
      if (statement instanceof Unknown
            && pos.getRow() !== statement.getStart().getRow()) {

        let message = this.missingSpace(statement) ? 2 : 1;

        pos = statement.getStart();
        let issue = new Issue(this, file, message, pos);
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