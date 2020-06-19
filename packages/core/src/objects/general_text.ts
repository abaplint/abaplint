import {AbstractObject} from "./_abstract_object";

export class GeneralText extends AbstractObject {

  public getType(): string {
    return "DOCT";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
