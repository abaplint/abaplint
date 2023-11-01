import {AbstractToken} from "./abstract_token";


export class WDash extends AbstractToken {
  public static railroad(): string {
    return " -";
  }
}
