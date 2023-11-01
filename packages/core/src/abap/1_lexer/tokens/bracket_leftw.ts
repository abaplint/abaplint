import {AbstractToken} from "./abstract_token";

export class BracketLeftW extends AbstractToken {
  public static railroad(): string {
    return "[ ";
  }
}
