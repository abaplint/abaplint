import {ABAPObject} from "./_abap_object";
import {IInterfaceDefinition} from "../abap/types/_interface_definition";
import {ABAPFile} from "../abap/abap_file";

export class Interface extends ABAPObject {
  private def: IInterfaceDefinition | undefined = undefined;
  private parsedXML: {name?: string, description?: string} | undefined = undefined;

  public getType(): string {
    return "INTF";
  }

  public setDefinition(def: IInterfaceDefinition | undefined): void {
    this.def = def;
  }

  public getSequencedFiles(): readonly ABAPFile[] {
    const main = this.getMainABAPFile();
    if (main === undefined) {
      return [];
    }
    return [main];
  }

  public getDefinition(): IInterfaceDefinition | undefined {
    return this.def;
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public setDirty(): void {
    this.def = undefined;
    this.parsedXML = undefined;
    super.setDirty();
  }

  public getNameFromXML(): string | undefined {
    this.parseXML();
    return this.parsedXML?.name;
  }

  public getDescription(): string | undefined {
    this.parseXML();
    return this.parsedXML?.description;
  }

/////////////////////////

  protected parseXML() {
    if (this.parsedXML !== undefined) {
      return;
    }

    this.parsedXML = {};

    const parsed = super.parseXML();
    if (parsed === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return;
    }

    const vseo = parsed.abapGit["asx:abap"]["asx:values"].VSEOINTERF;

    this.parsedXML.description = vseo.DESCRIPT ? vseo.DESCRIPT._text : "";
    this.parsedXML.name = vseo.CLSNAME ? vseo.CLSNAME._text : "";
  }

}