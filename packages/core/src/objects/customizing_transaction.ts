import {AbstractObject} from "./_abstract_object";

export class CustomizingTransaction extends AbstractObject {

  public getType(): string {
    return "CUS1";
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }
}
