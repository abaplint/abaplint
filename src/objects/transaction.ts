import {AbstractObject} from "./_abstract_object";

export class Transaction extends AbstractObject {

  public getType(): string {
    return "TRAN";
  }

}