import { Token, Pragma } from "../tokens/";
import Position from "../position";

export abstract class Statement {

  private tokens: Array<Token>;
  private children: Array<Statement>;
  private parent: Statement;

  public static match(tokens: Array<Token>): Statement {
    return undefined;
  }

  public static concat(tokens: Array<Token>): string {
    let str = "";
    let prev: Token;
    for (let token of tokens) {
      if (token instanceof Pragma) {
        continue;
      }
      if (str === "") {
        str = token.getStr();
      } else if (prev.getStr().length + prev.getCol() === token.getCol()
          && prev.getRow() === token.getRow()) {
        str = str + token.getStr();
      } else {
        str = str + " " + token.getStr();
      }
      prev = token;
    }
    return str;
  }

  public constructor(tokens: Array<Token>) {
    this.tokens = tokens;
    this.children = [];
    this.parent = undefined;
  }

  public addChild(child: Statement) {
    this.children.push(child);
  }

  public setParent(parent: Statement) {
    this.parent = parent;
  }

  public getChildren() {
    return this.children;
  }

  public getParent() {
    return this.parent;
  }

  public getStart(): Position {
    return this.tokens[0].getPos();
  }

  public getEnd(): Position {
    return this.tokens[this.tokens.length - 1].getPos();
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }

  public concatTokens(): string {
    return Statement.concat(this.tokens);
  }

  public getTerminator(): string {
    return this.getTokens()[this.getTokens().length - 1].getStr();
  }

}