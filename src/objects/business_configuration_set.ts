import {AbstractObject} from "./_abstract_object";

export class BusinessConfigurationSet extends AbstractObject {

  public getType(): string {
    return "SCP1";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}