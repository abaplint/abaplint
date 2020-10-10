import {ABAPObject} from "./_abap_object";
import {InfoClassDefinition} from "../abap/4_file_information/_abap_file_information";
import {IClassDefinition} from "../abap/types/_class_definition";
import {Identifier} from "../abap/4_file_information/_identifier";
import {ABAPFile} from "../abap/abap_file";

export enum ClassCategory {
  Test = "05",
  Persistent = "10",
  PersistentFactory = "11",
  Exception = "40",
  SharedObject = "45",
}

export class Class extends ABAPObject {
  private def: IClassDefinition | undefined = undefined;
  private parsedXML: {name?: string, description?: string, category?: string} | undefined = undefined;

  public getType(): string {
    return "CLAS";
  }

  public getSequencedFiles(): readonly ABAPFile[] {
    const sequence = [".clas.locals_def.abap", ".clas.locals_imp.abap", ".clas.abap", ".clas.testclasses.abap"];
    const copy = this.getABAPFiles().slice().sort((a, b) => {
      const aValue = sequence.findIndex((s) => a.getFilename().endsWith(s));
      const bValue = sequence.findIndex((s) => b.getFilename().endsWith(s));
      return aValue - bValue;
    });
    return copy;
  }

  public setDefinition(def: IClassDefinition | undefined): void {
    this.def = def;
  }

  public getDefinition(): IClassDefinition | undefined {
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

  public getClassDefinition(): InfoClassDefinition | undefined {
    return this.getMainABAPFile()?.getInfo().getClassDefinitionByName(this.getName());
  }

  public getIdentifier(): Identifier | undefined {
    return this.getClassDefinition()?.identifier;
  }

// -------------------

  public getDescription(): string | undefined {
    this.parseXML();
    return this.parsedXML?.description;
  }

  public getNameFromXML(): string | undefined {
    this.parseXML();
    return this.parsedXML?.name;
  }

  public getCategory(): string | undefined {
    this.parseXML();
    // https://blog.mariusschulz.com/2017/10/27/typescript-2-4-string-enums#no-reverse-mapping-for-string-valued-enum-members
    return this.parsedXML?.category;
  }

  public getLocalsImpFile(): ABAPFile | undefined {
    for (const file of this.getABAPFiles()) {
      if (file.getFilename().endsWith(".clas.locals_imp.abap")) {
        return file;
      }
    }
    return undefined;
  }

/////////////////////////

  private parseXML() {
    if (this.parsedXML !== undefined) {
      return;
    }

    this.parsedXML = {};

    const parsed = super.parseRaw();
    if (parsed === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return;
    }

    const vseo = parsed.abapGit["asx:abap"]["asx:values"].VSEOCLASS;

    this.parsedXML.category = vseo.CATEGORY?._text;
    this.parsedXML.description = vseo.DESCRIPT ? vseo.DESCRIPT._text : "";
    this.parsedXML.name = vseo.CLSNAME ? vseo.CLSNAME._text : "";
  }

}