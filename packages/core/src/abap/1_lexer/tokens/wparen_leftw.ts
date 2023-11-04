import {AbstractToken} from "./abstract_token";


export class WParenLeftW extends AbstractToken {
  public static railroad(): string {
    return " ( ";
  }
}
