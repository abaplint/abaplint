import { AbstractToken } from "./abstract_token";


export class WBracketRight extends AbstractToken {
  public static railroad(): string {
    return " ]";
  }
}
