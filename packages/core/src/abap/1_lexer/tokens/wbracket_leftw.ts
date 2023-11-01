import {AbstractToken} from "./abstract_token";

export class WBracketLeftW extends AbstractToken {
  public static railroad(): string {
    return " [ ";
  }
}
