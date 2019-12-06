import {AbstractObject} from "./_abstract_object";

export class GeneralText extends AbstractObject {

  public getType(): string {
    return "DOCT";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}