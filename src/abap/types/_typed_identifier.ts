// import {Type} from "./type";
import {Identifier} from "./_identifier";
import {Token} from "../tokens/_token";

export abstract class TypedIdentifier extends Identifier {
//  private type: Type;
  constructor(token: Token) {
    super(token);
  }
/*
  public getType() {
    return this.type;
  }
*/
}