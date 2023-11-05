import {AbstractToken} from "./abstract_token";

export class ParenRight extends AbstractToken {
  public static railroad(): string {
    return ")";
  }
}

