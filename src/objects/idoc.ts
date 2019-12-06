import {AbstractObject} from "./_abstract_object";

export class Idoc extends AbstractObject {

  public getType(): string {
    return "IDOC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}