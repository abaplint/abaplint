import { Token } from "./tokens/";
import { Statement } from "./statements/";
import Issue from "./issue";

export default class File {
  private tokens: Array<Token> = [];
  private statements: Array<Statement> = [];
  private nesting: Array<Statement> = [];
  private issues: Array<Issue> = [];
  private raw: string = "";
  private filename: string = "";

  constructor(filename: string, raw: string) {
    this.raw = raw.replace(/\r/g, ""); // ignore all carriage returns
    this.filename = filename;
  }

  public add(issue: Issue) {
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

  public setStatements(statements: Array<Statement>) {
    this.statements = statements;
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }

  public getStatements(): Array<Statement> {
    return this.statements;
  }

  public setNesting(nesting: Array<Statement>) {
    this.nesting = nesting;
  }

  public getNesting(): Array<Statement> {
    return this.nesting;
  }
}