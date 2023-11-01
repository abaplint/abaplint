import {AbstractToken} from "./abstract_token";

export class WAtW extends AbstractToken {
  public static railroad(): string {
    return " @ ";
  }
}
