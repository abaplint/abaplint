import {AbstractToken} from "./abstract_token";

export class WAt extends AbstractToken {
  public static railroad(): string {
    return " @";
  }
}
