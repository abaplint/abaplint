import {AbstractObject} from "./_abstract_object";

export class Package extends AbstractObject {

  public getType(): string {
    return "DEVC";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}