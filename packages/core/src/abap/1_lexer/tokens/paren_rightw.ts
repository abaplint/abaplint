import { AbstractToken } from "./abstract_token";


export class ParenRightW extends AbstractToken {
  public static railroad(): string {
    return ") ";
  }
}
