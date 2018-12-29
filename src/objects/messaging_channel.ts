import {AbstractObject} from "./_abstract_object";

export class MessagingChannel extends AbstractObject {

  public getType(): string {
    return "SAMC";
  }

}