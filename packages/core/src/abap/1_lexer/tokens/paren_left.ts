import {AbstractToken} from "./abstract_token";

export class ParenLeft extends AbstractToken {
  public static railroad(): string {
    return "(";
  }
}

