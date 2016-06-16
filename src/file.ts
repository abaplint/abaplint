import { Token } from "./tokens/";
import * as Statements from "./statements/";
import Issue from "./issue";

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
// ignore global exception classes
    if (/zcx_.*\.clas\.abap$/.test(this.filename)) {
      return true;
    }
    return false;
  }

}