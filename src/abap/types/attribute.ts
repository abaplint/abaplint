// import {Type} from "./type";
import {Position} from "../../position";


export class Attribute {
  private name: string;
  private position: Position;
//  private type: Type;

  constructor(name: string, position: Position) {
    this.name = name;
    this.position = position;
//    this.type = undefined;
  }

  public getName() {
    return this.name;
  }

  public getPosition() {
    return this.position;
  }
/*
  public getType() {
    return this.type;
  }
*/
}