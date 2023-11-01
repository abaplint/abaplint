import { AbstractToken } from "./abstract_token";


export class WInstanceArrow extends AbstractToken {
  public static railroad(): string {
    return " ->";
  }
}
