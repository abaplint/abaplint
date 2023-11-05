import {AbstractToken} from "./abstract_token";

export class Plus extends AbstractToken {
  public static railroad(): string {
    return "+";
  }
}