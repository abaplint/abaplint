import {AbstractObject} from "./_abstract_object";

export class Documentation extends AbstractObject {

  public getType(): string {
    return "DOCV";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}