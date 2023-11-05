import {AbstractToken} from "./abstract_token";


export class WStaticArrowW extends AbstractToken {
  public static railroad(): string {
    return " => ";
  }
}
