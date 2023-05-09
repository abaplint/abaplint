import {ABAPObject} from "./_abap_object";
import {ABAPFile} from "../abap/abap_file";

export class Program extends ABAPObject {
  private parsedXML: {
    isInclude: boolean,
    isModulePool: boolean,
  } | undefined;

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

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.parsedXML = undefined;
    super.setDirty();
  }

  public isInclude(): boolean {
    this.parseXML();
    return this.parsedXML!.isInclude;
  }

  public isModulePool(): boolean {
    this.parseXML();
    return this.parsedXML!.isModulePool;
  }

  public parseXML() {
    if (this.parsedXML === undefined) {
      const file = this.getXMLFile();
      this.parsedXML = {
        isInclude: file ? file.getRaw().includes("<SUBC>I</SUBC>") : false,
        isModulePool: file ? file.getRaw().includes("<SUBC>M</SUBC>") : false,
      };
    }
  }
}
