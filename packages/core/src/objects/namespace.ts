import {AbstractObject} from "./_abstract_object";

export class Namespace extends AbstractObject {

  public getType(): string {
    return "NSPC";
  }

  public getAllowedNaming() {
    return {
      maxLength: 10,
      allowNamespace: true,
    };
  }
}
