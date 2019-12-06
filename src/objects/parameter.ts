import {AbstractObject} from "./_abstract_object";

export class Parameter extends AbstractObject {

  public getType(): string {
    return "PARA";
  }

  public getAllowedNaming() {
    return {
      maxLength: 20,
      allowNamespace: true,
    };
  }
}