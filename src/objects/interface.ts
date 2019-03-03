import {ABAPObject} from "./_abap_object";
import {InterfaceDefinition} from "../abap/types";
import {ABAPFile} from "../files";
import {IFile} from "../files/_ifile";

export class Interface extends ABAPObject {

  public getType(): string {
    return "INTF";
  }

  public getDefinition(): InterfaceDefinition | undefined {
    const main = this.getMain();
    if (!main) {
      return undefined;
    }
    const definitions = main.getInterfaceDefinitions();
    if (definitions.length === 0) {
      return undefined;
    }
    return definitions[0];
  }

  private getMain(): ABAPFile | undefined {
    const files = this.getABAPFiles();
    if (files.length > 1) {
      throw new Error("interface.ts, did not expect multiple parsed files");
    }
    return files[0];
  }

  public getXMLFile(): IFile | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.intf\.xml$/i)) {
        return file;
      }
    }
    return undefined;
  }

  public getXML(): string | undefined {
    const file = this.getXMLFile();
    if (file) {
      return file.getRaw();
    }
    return undefined;
  }

}