import {AbstractToken} from "./abstract_token";


export class StaticArrowW extends AbstractToken {
  public static railroad(): string {
    return "=> ";
  }
}
