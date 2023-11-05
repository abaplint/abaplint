import {Position} from "../../position";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";

export class Identifier {
  private readonly token: AbstractToken;
  protected readonly filename: string;

  public constructor(token: AbstractToken, filename: string) {
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

  public equals(id: Identifier): boolean {
    // note how the boolean condition is evalulated lazily
    return id.getStart().equals(this.getStart())
      && id.getFilename() === this.getFilename();
  }

  public getToken(): AbstractToken {
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