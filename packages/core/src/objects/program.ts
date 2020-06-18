import {ABAPObject} from "./_abap_object";
import {ABAPFile} from "../abap/abap_file";

export class Program extends ABAPObject {

  public getType(): string {
    return "PROG";
  }

  public getSequencedFiles(): readonly ABAPFile[] {
    const main = this.getMainABAPFile();
    if (main === undefined) {
      return [];
    }
    return [main];
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public isInclude(): boolean {
    const file = this.getXMLFile();
    if (file) {
      return file.getRaw().includes("<SUBC>I</SUBC>");
    }
    return false;
  }

}
