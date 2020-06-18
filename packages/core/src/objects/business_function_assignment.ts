import {AbstractObject} from "./_abstract_object";

export class BusinessFunctionAssignment extends AbstractObject {

  public getType(): string {
    return "SFBF";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }
}
