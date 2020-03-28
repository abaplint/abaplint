import {AbstractObject} from "./_abstract_object";

export class DataControl extends AbstractObject {

  public getType(): string {
    return "DCLS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}