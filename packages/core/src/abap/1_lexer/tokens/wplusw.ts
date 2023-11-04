import {AbstractToken} from "./abstract_token";


export class WPlusW extends AbstractToken {
  public static railroad(): string {
    return " + ";
  }
}
