import {ABAPObject} from "./_abap_object";

export class Program extends ABAPObject {

  public getType(): string {
    return "PROG";
  }

  public isInclude(): boolean {
    const file = this.getXMLFile();
    if (file) {
      return file.getRaw().includes("<SUBC>I</SUBC>");
    }
    return false;
  }

}