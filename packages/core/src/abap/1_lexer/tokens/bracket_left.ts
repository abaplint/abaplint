import {AbstractToken} from "./abstract_token";

export class BracketLeft extends AbstractToken {
  public static railroad(): string {
    return "[";
  }
}