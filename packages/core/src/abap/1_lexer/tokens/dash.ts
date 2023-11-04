import {AbstractToken} from "./abstract_token";

export class Dash extends AbstractToken {
  public static railroad(): string {
    return "-";
  }
}

