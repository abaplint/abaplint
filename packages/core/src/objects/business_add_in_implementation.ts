import {AbstractObject} from "./_abstract_object";

export class BusinessAddInImplementation extends AbstractObject {

  public getType(): string {
    return "SXCI";
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }
}
