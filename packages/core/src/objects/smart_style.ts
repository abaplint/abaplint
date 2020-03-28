import {AbstractObject} from "./_abstract_object";

export class SmartStyle extends AbstractObject {

  public getType(): string {
    return "SSST";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}