import {Position} from "../../position";
import {Token} from "../1_lexer/tokens/_token";

export class Identifier {
  private readonly token: Token;
  protected readonly filename: string;

  public constructor(token: Token, filename: string) {
    this.token = token;
    this.filename = filename;
  }

  public getName() {
    let name = this.token.getStr();

    // todo, should this be handled in the parser instead?
    if (name.substr(0, 1) === "!") {
      name = name.substr(1);
    }

    return name;
  }

  public getToken(): Token {
    return this.token;
  }

  public getFilename(): string {
    return this.filename;
  }

  public getStart(): Position {
    return this.token.getStart();
  }

  public getEnd(): Position {
    return this.token.getEnd();
  }
}