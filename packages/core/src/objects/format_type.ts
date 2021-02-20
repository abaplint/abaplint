import {AbstractObject} from "./_abstract_object";

export class FormatType extends AbstractObject {

  public getType(): string {
    return "SPLO";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

}