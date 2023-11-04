import {AbstractToken} from "./abstract_token";


export class ParenLeftW extends AbstractToken {
  public static railroad(): string {
    return "( ";
  }
}
