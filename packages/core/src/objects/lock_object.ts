import {AbstractObject} from "./_abstract_object";

export class LockObject extends AbstractObject {

  public getType(): string {
    return "ENQU";
  }

  public getAllowedNaming() {
    return {
      maxLength: 16,
      allowNamespace: true,
    };
  }

}
