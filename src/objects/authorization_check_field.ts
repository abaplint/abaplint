import {AbstractObject} from "./_abstract_object";

export class AuthorizationCheckField extends AbstractObject {

  public getType(): string {
    return "AUTH";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}