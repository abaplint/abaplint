import {ABAPObject} from "./_abap_object";
import {ABAPFile} from "../abap/abap_file";
import {DynproList, parseDynpros} from "./_dynpros";

export class Program extends ABAPObject {
  private parsedXML: {
    isInclude: boolean,
    isModulePool: boolean,
    dynpros: DynproList,
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

  public getDynpros(): DynproList {
    this.parseXML();
    return this.parsedXML!.dynpros || [];
  }

////////////////////////////

  private parseXML() {
    if (this.parsedXML !== undefined) {
      return;
    }

    const file = this.getXMLFile();
    const parsed = this.parseRaw2();
    if (parsed === undefined) {
      this.parsedXML = {
        isInclude: false,
        isModulePool: false,
        dynpros: [],
      };
      return;
    }

    const dynpros = parseDynpros(parsed);

    this.parsedXML = {
      isInclude: file ? file.getRaw().includes("<SUBC>I</SUBC>") : false,
      isModulePool: file ? file.getRaw().includes("<SUBC>M</SUBC>") : false,
      dynpros: dynpros,
    };
  }
}
