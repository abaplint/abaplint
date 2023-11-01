import { AbstractToken } from "./abstract_token";


export class WPlus extends AbstractToken {
  public static railroad(): string {
    return " +";
  }
}
