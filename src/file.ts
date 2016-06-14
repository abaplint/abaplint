import { Token } from "./tokens/";
import * as Statements from "./statements/";
import Issue from "./issue";
import Position from "./position";

export default class File {
  private tokens: Array<Token> = [];
  private statements: Array<Statements.Statement> = [];
  private nesting: Array<Statements.Statement> = [];
  private issues: Array<Issue> = [];
  private raw: string = "";
  private filename: string = "";

  constructor(filename: string, raw: string) {
    this.raw = raw.replace(/\r/g, ""); // ignore all carriage returns
    this.filename = filename;
  }

  public add(issue: Issue) {
    if (this.skip(issue)) {
      return;
    }
    this.issues.push(issue);
  }

  public getIssueCount(): number {
    return this.issues.length;
  }

  public getIssues(): Array<Issue> {
    return this.issues;
  }

  public getRaw(): string {
    return this.raw;
  }

  public getRawRows(): Array<string> {
    return this.raw.split("\n");
  }

  public getFilename(): string {
    return this.filename;
  }

  public setTokens(tokens: Array<Token>) {
    this.tokens = tokens;
  }

  public setStatements(statements: Array<Statements.Statement>) {
    this.statements = statements;
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }

  public getStatements(): Array<Statements.Statement> {
    return this.statements;
  }

  public setNesting(nesting: Array<Statements.Statement>) {
    this.nesting = nesting;
  }

  public getNesting(): Array<Statements.Statement> {
    return this.nesting;
  }

  private skip(issue: Issue): boolean {
    let statement = this.positionToStatement(issue.getStart());
    if (statement) {
      let parents = this.buildParentList(statement);

      if (parents[0] instanceof Statements.Class
          && parents[1] instanceof Statements.Method
          && /^ZCX_/.test(parents[0].getTokens()[1].getStr())
          && /^CONSTRUCTOR$/i.test(parents[1].getTokens()[1].getStr())
          ) {
// skip class based exception, method constructor
        return true;
      }
    }

    return false;
  }

  private buildParentList(statement: Statements.Statement): Array<Statements.Statement> {
    let ret = [];
    let current = statement;

    while (current.getParent()) {
      ret.push(current.getParent());
      current = current.getParent();
    }

    return ret.reverse();
  }

  private positionToStatement(pos: Position): Statements.Statement {
// assumption: max one statement per line
    for (let statement of this.statements) {
      if (statement.getStart().getRow() <= pos.getRow()
          && statement.getEnd().getRow() >= pos.getRow()) {
        return statement;
      }
    }
    return undefined;
  }
}