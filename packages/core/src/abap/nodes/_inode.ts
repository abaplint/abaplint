import {AbstractToken} from "../1_lexer/tokens/abstract_token";

export interface INode {
  addChild(n: INode): void;
  setChildren(children: INode[]): void;
  getChildren(): readonly INode[];
  get(): object;
  getFirstToken(): AbstractToken;
  getLastToken(): AbstractToken;
}
