import {AbstractObject} from "./_abstract_object";

export class SAPScript extends AbstractObject {

  public getType(): string {
    return "FORM";
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }
}