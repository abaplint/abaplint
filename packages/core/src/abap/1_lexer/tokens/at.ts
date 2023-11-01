import {AbstractToken} from "./abstract_token";

export class At extends AbstractToken {
  public static railroad(): string {
    return "@";
  }
}