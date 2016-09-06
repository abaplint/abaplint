import {Token} from "./tokens/";
import {Statement} from "./statements/statement";
import {RootNode} from "./node";

export class File {
  private raw: string = "";
  private filename: string = "";

  constructor(filename: string, raw: string) {
    this.raw = raw.replace(/\r/g, ""); // ignore all carriage returns
    this.filename = filename;
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

}

export class ParsedFile extends File {

  private tokens: Array<Token> = [];
  private statements: Array<Statement> = [];
  private root: RootNode;

  public constructor(filename, raw, tokens, statements, root) {
    super(filename, raw);
    this.tokens     = tokens;
    this.statements = statements;
    this.root       = root;
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }

  public getRoot(): RootNode {
    return this.root;
  }

  public getStatements(): Array<Statement> {
    return this.statements;
  }
}