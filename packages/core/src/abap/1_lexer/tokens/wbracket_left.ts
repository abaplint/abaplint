import { AbstractToken } from "./abstract_token";


export class WBracketLeft extends AbstractToken {
  public static railroad(): string {
    return " [";
  }
}
