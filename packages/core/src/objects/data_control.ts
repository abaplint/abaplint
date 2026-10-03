import {AbstractObject} from "./_abstract_object";

export class DataControl extends AbstractObject {

  public getType(): string {
    return "DCLS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }
}
