import {AbstractToken} from "../1_lexer/tokens/abstract_token";

export interface INode {
  addChild(n: INode): void;
  setChildren(children: INode[]): void;
  getChildren(): readonly INode[];
  get(): any;
  getFirstToken(): AbstractToken;
  getLastToken(): AbstractToken;
// todo, consider adding find* get* methods from nodes, subclasses currently contain similar methods
}
