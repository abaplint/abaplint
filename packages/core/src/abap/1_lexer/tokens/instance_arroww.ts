import { AbstractToken } from "./abstract_token";


export class InstanceArrowW extends AbstractToken {
  public static railroad(): string {
    return "-> ";
  }
}
