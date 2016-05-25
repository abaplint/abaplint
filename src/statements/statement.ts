import { Token, Pragma } from "../tokens/";
import Position from "../position";

export abstract class Statement {

  private tokens: Array<Token>;

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
  }

  public getStart(): Position {
    return this.getTokens()[0].getPos();
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