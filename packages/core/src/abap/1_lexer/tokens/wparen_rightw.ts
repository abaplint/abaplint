import {AbstractToken} from "./abstract_token";


export class WParenRightW extends AbstractToken {
  public static railroad(): string {
    return " ) ";
  }
}
