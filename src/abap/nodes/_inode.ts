import {Token} from "../tokens/_token";

export interface INode {
  addChild(n: INode): INode;
  setChildren(children: INode[]): INode;
  getChildren(): INode[];
  get(): any;
  getFirstToken(): Token;
  getLastToken(): Token;
// todo, consider adding find* get* methods from nodes, subclasses currently contain similar methods
}
