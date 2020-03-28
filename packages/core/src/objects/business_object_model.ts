import {AbstractObject} from "./_abstract_object";

export class BusinessObjectModel extends AbstractObject {

  public getType(): string {
    return "BOBF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}