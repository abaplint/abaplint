import {AbstractObject} from "./_abstract_object";

export class AuthorizationObjectExtension extends AbstractObject {

  public getType(): string {
    return "SIA3";
  }

  public getAllowedNaming() {
    return {
      maxLength: 100,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}