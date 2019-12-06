import {AbstractObject} from "./_abstract_object";

export class DialogModule extends AbstractObject {

  public getType(): string {
    return "DIAL";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}