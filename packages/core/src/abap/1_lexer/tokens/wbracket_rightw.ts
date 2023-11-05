import {AbstractToken} from "./abstract_token";


export class WBracketRightW extends AbstractToken {
  public static railroad(): string {
    return " ] ";
  }
}
