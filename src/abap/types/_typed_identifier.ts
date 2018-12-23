// import {Type} from "./type";
import {Position} from "../../position";
import {Identifier} from "./_identifier";

export abstract class TypedIdentifier extends Identifier {
//  private type: Type;
  constructor(name: string, position: Position) {
    super(name, position);
  }
/*
  public getType() {
    return this.type;
  }
*/
}