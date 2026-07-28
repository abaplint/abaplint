import {ABAPObject} from "./_abap_object";
import {IInterfaceDefinition} from "../abap/types/_interface_definition";
import {ABAPFile} from "../abap/abap_file";
import {InfoInterfaceDefinition} from "../abap/4_file_information/_abap_file_information";
import {Identifier} from "../abap/4_file_information/_identifier";

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

  public getInterface(): InfoInterfaceDefinition | undefined {
    return this.getMainABAPFile()?.getInfo().getInterfaceDefinitionByName(this.getName());
  }

  public getIdentifier(): Identifier | undefined {
    return this.getInterface()?.identifier;
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
    this.parseMetadata();
    return this.parsedXML?.name;
  }

  public getDescription(): string | undefined {
    this.parseMetadata();
    return this.parsedXML?.description;
  }

/////////////////////////

  private parseMetadata() {
    if (this.parsedXML !== undefined) {
      return;
    }

    this.parsedXML = {};

    // Try AFF JSON format first
    const jsonFile = this.getJSONFile();
    if (jsonFile) {
      this.parseAFF(jsonFile);
      return;
    }

    // Fall back to XML format
    const parsed = super.parseRaw2();
    if (parsed === undefined
        || parsed.abapGit["asx:abap"]["asx:values"] === undefined) {
      // No metadata file found at all
      this.parsedXML.description = "";
      this.parsedXML.name = "";
      return;
    }

    const vseo = parsed.abapGit["asx:abap"]["asx:values"].VSEOINTERF;
    if (vseo === undefined) {
      this.parsedXML.description = "";
      this.parsedXML.name = "";
    } else {
      this.parsedXML.description = vseo.DESCRIPT ? vseo.DESCRIPT : "";
      this.parsedXML.name = vseo.CLSNAME ? vseo.CLSNAME : "";
    }
  }

  private getJSONFile() {
    const search = this.getName().toLowerCase() + ".intf.json";
    const files = this.getFiles();
    for (const file of files) {
      if (file.getFilename().toLowerCase().endsWith(search)) {
        return file;
      }
    }
    return undefined;
  }

  private parseAFF(file: any) {
    try {
      const content = file.getRaw();
      const json = JSON.parse(content);

      // Extract description from AFF JSON format
      if (json.header && json.header.description) {
        this.parsedXML!.description = json.header.description;
      } else {
        this.parsedXML!.description = "";
      }

      // Name comes from the object name, not the JSON
      this.parsedXML!.name = this.getName();
    } catch (error) {
      // If JSON parsing fails, fall back to empty values
      this.parsedXML!.description = "";
      this.parsedXML!.name = "";
    }
  }

}