import {Type} from "./type";

export class Attribute {
  private name: string;
  private type: Type;

  constructor(name: string) {
    this.name = name;
    this.type = undefined;
  }

  public getName() {
    return this.name;
  }

  public getType() {
    return this.type;
  }
}