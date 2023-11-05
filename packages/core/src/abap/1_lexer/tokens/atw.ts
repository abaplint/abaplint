import {AbstractToken} from "./abstract_token";

export class AtW extends AbstractToken {
  public static railroad(): string {
    return "@ ";
  }
}
