import {ABAPObject} from "./_abap_object";

export class TypePool extends ABAPObject {

  public getType(): string {
    return "TYPE";
  }

  public getAllowedNaming() {
    return {
      maxLength: 5,
      allowNamespace: false,
    };
  }
}