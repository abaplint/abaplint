import {AbstractObject} from "./_abstract_object";

export class AuthorizationObjectClass extends AbstractObject {

  public getType(): string {
    return "SUSC";
  }

  public getAllowedNaming() {
    return {
      maxLength: 4,
      allowNamespace: false,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}