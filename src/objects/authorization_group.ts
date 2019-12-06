import {AbstractObject} from "./_abstract_object";

export class AuthorizationGroup extends AbstractObject {

  public getType(): string {
    return "SUCU";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}