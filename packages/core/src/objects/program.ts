import {ABAPObject} from "./_abap_object";
import {ABAPFile} from "../abap/abap_file";

export class Program extends ABAPObject {
  private isIncludeValue: boolean | undefined = undefined;

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
    this.isIncludeValue = undefined;
    super.setDirty();
  }

  public isInclude(): boolean {
    if (this.isIncludeValue === undefined) {
      const file = this.getXMLFile();
      this.isIncludeValue = file ? file.getRaw().includes("<SUBC>I</SUBC>") : false;
    }

    return this.isIncludeValue;
  }

}
