import {AbstractToken} from "./abstract_token";


export class WInstanceArrowW extends AbstractToken {
  public static railroad(): string {
    return " -> ";
  }
}
