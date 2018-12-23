// import {Type} from "./type";
import {Identifier} from "./_identifier";
import {Token} from "../tokens/_token";
import {INode} from "../nodes/_inode";

export abstract class TypedIdentifier extends Identifier {
//  private type: Type;
  constructor(token: Token, node: INode) {
    super(token, node);
  }
/*
  public getType() {
    return this.type;
  }
*/
}