import {AbstractToken} from "./abstract_token";


export class WParenLeft extends AbstractToken {
  public static railroad(): string {
    return " (";
  }
}
