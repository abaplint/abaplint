import { AbstractToken } from "./abstract_token";


export class PlusW extends AbstractToken {
  public static railroad(): string {
    return "+ ";
  }
}
