import {AbstractObject} from "./_abstract_object";

export class CustomizingAttributes extends AbstractObject {

  public getType(): string {
    return "CUS2";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}