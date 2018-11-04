import {ABAPObject} from "./_abap_object";

export class Transformation extends ABAPObject {

  public getType(): string {
    return "XSLT";
  }

}