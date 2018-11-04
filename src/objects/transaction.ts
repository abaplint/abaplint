import {AObject} from "./_aobject";

export class Transaction extends AObject {

  public getType(): string {
    return "TRAN";
  }

}