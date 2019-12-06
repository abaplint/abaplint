import {AbstractObject} from "./_abstract_object";

export class MessagingChannel extends AbstractObject {

  public getType(): string {
    return "SAMC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}