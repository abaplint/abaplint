import {ABAPObject} from "./_abap_object";

export class Interface extends ABAPObject {

  public getType(): string {
    return "INTF";
  }

}