import {AbstractObject} from "./_abstract_object";

export class AuthorizationGroup extends AbstractObject {

  public getType(): string {
    return "SUCU";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
