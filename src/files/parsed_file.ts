import {Token, Pragma} from "../abap/tokens/";
import {Statement} from "../abap/statements/statement";
import {RootNode} from "../abap/node";
import {File} from "./file";

// todo: rename to ABAPFile
export class ParsedFile extends File {
  // tokens vs statements: pragmas are part of tokens but not in statements
  // todo: need some better way of handling pragmas
  private tokens: Array<Token>;
  private statements: Array<Statement>;
  private root: RootNode;

  public constructor(f, tokens, statements, root) {
    super(f.getFilename(), f.getRaw());
    this.tokens     = tokens;
    this.statements = statements;
    this.root       = root;
  }
  /*
    public static fromJSON(str: string): ParsedFile {
      let json = JSON.parse(str);

      let file: File = new File(json.filename, json.raw);
      let tokens: Array<Token> = undefined;
      let statements: Array<Statement> = undefined;
      let root: RootNode = undefined;

      return new ParsedFile(file, tokens, statements, root);
    }
  */
  public getTokens(withPragmas = true): Array<Token> {
    if (withPragmas === true) {
      return this.tokens;
    } else {
      let tokens = [];
      this.tokens.forEach((t) => {
        if (!(t instanceof Pragma)) {
          tokens.push(t);
        }
      });
      return tokens;
    }
  }

  public getRoot(): RootNode {
    return this.root;
  }

  public getStatements(): Array<Statement> {
    return this.statements;
  }

  public setStatements(s: Array<Statement>): void {
    this.statements = s;
  }
  /*
    private statementsToTokens(): Array<Token> {
      let ret: Array<Token> = [];

      this.getStatements().forEach((s) => {
        ret = ret.concat(s.getTokens());
      });

      return ret;
    }
  */
}