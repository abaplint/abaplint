import {ABAPObject} from "./_abap_object";

export class Program extends ABAPObject {

  public getType(): string {
    return "PROG";
  }

}