import {AbstractObject} from "./_abstract_object";

export class BusinessFunctionSetAssignment extends AbstractObject {

  public getType(): string {
    return "SFBS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}