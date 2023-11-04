import {AbstractToken} from "./abstract_token";

export class InstanceArrow extends AbstractToken {
  public static railroad(): string {
    return "->";
  }
}

