import {AbstractObject} from "./_abstract_object";

export class Classification extends AbstractObject {

  public getType(): string {
    return "AVAS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}