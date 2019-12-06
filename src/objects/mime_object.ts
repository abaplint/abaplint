import {AbstractObject} from "./_abstract_object";

export class MIMEObject extends AbstractObject {

  public getType(): string {
    return "SMIM";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}