import {AbstractObject} from "./_abstract_object";

export class MessageClass extends AbstractObject {

  public getType(): string {
    return "MSAG";
  }

}