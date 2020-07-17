import {AbstractObject} from "./_abstract_object";

export class Transformation extends AbstractObject {

  public getType(): string {
    return "XSLT";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

}
