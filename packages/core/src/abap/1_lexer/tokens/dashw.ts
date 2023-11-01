import { AbstractToken } from "./abstract_token";


export class DashW extends AbstractToken {
  public static railroad(): string {
    return "- ";
  }
}
