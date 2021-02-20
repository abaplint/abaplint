import {AbstractObject} from "./_abstract_object";

export class FieldCatalog extends AbstractObject {

  public getType(): string {
    return "ASFC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}