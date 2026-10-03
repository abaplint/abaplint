import {AbstractObject} from "./_abstract_object";

export class BSPApplication extends AbstractObject {

  public getType(): string {
    return "WAPA";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
