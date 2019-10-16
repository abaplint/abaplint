import {Position} from "../../position";
import {Token} from "../tokens/_token";

export class Identifier {
  private readonly token: Token;

  constructor(token: Token) {
    this.token = token;
  }

  public getName() {
    let name = this.token.getStr();

    // todo, should this be handled in the parser instead?
    if (name.substr(0, 1) === "!") {
      name = name.substr(1);
    }

    return name;
  }

  public getStart(): Position {
    return this.token.getStart();
  }

  public getEnd(): Position {
    return this.token.getEnd();
  }
}