import {AbstractToken} from "./abstract_token";


export class WStaticArrow extends AbstractToken {
  public static railroad(): string {
    return " =>";
  }
}
