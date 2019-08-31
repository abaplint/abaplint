import {ABAPObject} from "./_abap_object";
import {IFile} from "../files/_ifile";

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

  public getXMLFile(): IFile | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.prog\.xml$/i)) {
        return file;
      }
    }
    return undefined;
  }

}