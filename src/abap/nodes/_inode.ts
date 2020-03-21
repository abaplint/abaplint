import {Token} from "../1_lexer/tokens/_token";

export interface INode {
  addChild(n: INode): INode;
  setChildren(children: INode[]): INode;
  getChildren(): readonly INode[];
  get(): any;
  getFirstToken(): Token;
  getLastToken(): Token;
// todo, consider adding find* get* methods from nodes, subclasses currently contain similar methods
}
