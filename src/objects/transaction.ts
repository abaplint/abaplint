import {Object} from "./object";

export class Transaction extends Object {

  public getType(): string {
    return "TRAN";
  }

}