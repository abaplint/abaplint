// import {Type} from "./type";
import {Position} from "../../position";

export abstract class Identifier {
  private name: string;
  private position: Position;

  constructor(name: string, position: Position) {
    this.name = name;
    this.position = position;

// todo, should this be handled in the parser instead?
    if (this.name.substr(0, 1) === "!") {
      this.name = this.name.substr(1);
    }
  }

  public getName() {
    return this.name;
  }

  public getPosition() {
    return this.position;
  }
}