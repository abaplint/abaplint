import {AbstractObject} from "./_abstract_object";

export class SmartForm extends AbstractObject {

  public getType(): string {
    return "SSFO";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
