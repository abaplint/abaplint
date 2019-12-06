import {AbstractObject} from "./_abstract_object";

export class PushChannel extends AbstractObject {

  public getType(): string {
    return "SAPC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}