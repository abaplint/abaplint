import {AbstractObject} from "./_abstract_object";

export class ExtensionIndex extends AbstractObject {

  public getType(): string {
    return "XINX";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 33,
      allowNamespace: true, 
    };
  }
}
