import {AbstractObject} from "./_abstract_object";

export class AuthorizationObject extends AbstractObject {

  public getType(): string {
    return "SUSO";
  }

  public getAllowedNaming() {
    return {
      maxLength: 10,
      allowNamespace: false,
    };
  }

}