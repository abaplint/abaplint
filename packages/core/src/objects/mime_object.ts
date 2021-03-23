import {AbstractObject} from "./_abstract_object";

export class MIMEObject extends AbstractObject {

  public getType(): string {
    return "SMIM";
  }

  public getAllowedNaming() {
    return {
      maxLength: 32,
      allowNamespace: false,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
