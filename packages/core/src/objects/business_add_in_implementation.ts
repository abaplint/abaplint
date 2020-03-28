import {AbstractObject} from "./_abstract_object";

export class BusinessAddInImplementation extends AbstractObject {

  public getType(): string {
    return "SXCI";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}