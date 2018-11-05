import {ABAPObject} from "./_abap_object";

export const type = "CLAS";

export class Class extends ABAPObject {

  public getType(): string {
    return type;
  }

}