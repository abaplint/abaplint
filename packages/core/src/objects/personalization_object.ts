import {AbstractObject} from "./_abstract_object";

export class PersonalizationObject extends AbstractObject {

  public getType(): string {
    return "PERS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
