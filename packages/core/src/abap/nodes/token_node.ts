import {Token} from "../1_lexer/tokens/_token";
import {AbstractNode} from "./_abstract_node";

export class TokenNode extends AbstractNode {
  private readonly token: Token;

  public constructor(token: Token) {
    super();
    this.token = token;
  }

  public get(): Token {
    return this.token;
  }

  public countTokens(): number {
    return 1;
  }

  public getFirstToken(): Token {
    return this.token;
  }

  public getLastToken(): Token {
    return this.token;
  }
}

export class TokenNodeRegex extends TokenNode {

}