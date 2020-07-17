import {ABAPObject} from "./_abap_object";
import {ABAPFile} from "../files";
import {InfoClassDefinition} from "../abap/4_file_information/_abap_file_information";
import {IClassDefinition} from "../abap/types/_class_definition";

export enum ClassCategory {
  Test = "05",
  Persistent = "10",
  PersistentFactory = "11",
  Exception = "40",
  SharedObject = "45",
}

export class Class extends ABAPObject {
  private def: IClassDefinition | undefined = undefined;

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
    super.setDirty();
  }

  public getClassDefinition(): InfoClassDefinition | undefined {
    return this.getMainABAPFile()?.getInfo().getClassDefinitionByName(this.getName());
  }

// -------------------

  public getDescription(): string | undefined {
    const xml = this.getXML();
    if (!xml) {
      return undefined;
    }
    const parsed = this.parseXML();
    if (parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return undefined;
    }
    const vseo = parsed.abapGit["asx:abap"]["asx:values"].VSEOCLASS;
    return vseo.DESCRIPT ? vseo.DESCRIPT._text : "";
  }

  public getNameFromXML(): string | undefined {
    const xml = this.getXML();
    if (!xml) {
      return undefined;
    }
    const parsed = this.parseXML();
    if (parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      return undefined;
    }
    const vseo = parsed.abapGit["asx:abap"]["asx:values"].VSEOCLASS;
    return vseo.CLSNAME ? vseo.CLSNAME._text : "";
  }

  public getCategory(): string | undefined {
    const xml = this.getXML();
    if (!xml) {
      return undefined;
    }
    const result = xml.match(/<CATEGORY>(\d{2})<\/CATEGORY>/);
    if (result) {
// https://blog.mariusschulz.com/2017/10/27/typescript-2-4-string-enums#no-reverse-mapping-for-string-valued-enum-members
      return result[1];
    } else {
      return undefined;
    }
  }

  public getLocalsImpFile(): ABAPFile | undefined {
    for (const file of this.getABAPFiles()) {
      if (file.getFilename().endsWith(".clas.locals_imp.abap")) {
        return file;
      }
    }
    return undefined;
  }

}