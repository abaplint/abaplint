import {AbstractObject} from "./_abstract_object";

export class BusinessObjectType extends AbstractObject {

  public getType(): string {
    return "SOBJ";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 200,
      allowNamespace: true,
    };
  }
}