import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {INode} from "./_inode";

export class TokenNode implements INode {
  private readonly token: AbstractToken;

  public constructor(token: AbstractToken) {
    this.token = token;
  }

  public addChild(_n: INode): void {
    throw new Error("TokenNode, Method not implemented.");
  }

  public setChildren(_children: INode[]): void {
    throw new Error("TokenNode, Method not implemented.");
  }

  public getChildren(): readonly INode[] {
    return [];
  }

  public concatTokens(): string {
    return this.token.getStr();
  }

  public get(): AbstractToken {
    return this.token;
  }

  public countTokens(): number {
    return 1;
  }

  public getFirstToken(): AbstractToken {
    return this.token;
  }

  public getLastToken(): AbstractToken {
    return this.token;
  }
}