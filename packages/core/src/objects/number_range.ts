import {AbstractObject} from "./_abstract_object";

export class NumberRange extends AbstractObject {

  public getType(): string {
    return "NROB";
  }

  public getAllowedNaming() {
    return {
      maxLength: 10,
      allowNamespace: true,
    };
  }
}