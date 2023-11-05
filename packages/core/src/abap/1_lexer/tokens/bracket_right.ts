import {AbstractToken} from "./abstract_token";

export class BracketRight extends AbstractToken {
  public static railroad(): string {
    return "]";
  }
}