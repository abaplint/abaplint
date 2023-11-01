import { AbstractToken } from "./abstract_token";


export class WParenRight extends AbstractToken {
  public static railroad(): string {
    return " )";
  }
}
