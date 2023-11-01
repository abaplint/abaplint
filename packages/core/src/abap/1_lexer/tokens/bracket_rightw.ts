import {AbstractToken} from "./abstract_token";


export class BracketRightW extends AbstractToken {
  public static railroad(): string {
    return "] ";
  }
}
