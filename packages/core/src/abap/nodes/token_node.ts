import {Token} from "../1_lexer/tokens/_token";
import {INode} from "./_inode";

export class TokenNode implements INode {
  private readonly token: Token;

  public constructor(token: Token) {
    this.token = token;
  }

  public addChild(_n: INode): void {
    // todo, can this method be removed?
    //throw new Error("Method not implemented.");
  }

  public setChildren(_children: INode[]): void {
    // todo, can this method be removed?
    //throw new Error("Method not implemented.");
  }

  public getChildren(): readonly INode[] {
    return [];
    // todo, can this method be removed?
    //throw new Error("Method not implemented.");
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