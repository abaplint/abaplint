import {AbstractToken} from "./abstract_token";

export class StaticArrow extends AbstractToken {
  public static railroad(): string {
    return "=>";
  }
}