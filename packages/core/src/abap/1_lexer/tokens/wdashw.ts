import {AbstractToken} from "./abstract_token";


export class WDashW extends AbstractToken {
  public static railroad(): string {
    return " - ";
  }
}
