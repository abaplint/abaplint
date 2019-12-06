import {AbstractObject} from "./_abstract_object";

export class CustomizingTransaction extends AbstractObject {

  public getType(): string {
    return "CUS1";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}