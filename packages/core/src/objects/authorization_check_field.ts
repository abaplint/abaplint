import {AbstractObject} from "./_abstract_object";

export class AuthorizationCheckField extends AbstractObject {

  public getType(): string {
    return "AUTH";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
