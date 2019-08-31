import {ABAPObject} from "./_abap_object";
import {InterfaceDefinition} from "../abap/types";
import {IFile} from "../files/_ifile";

export class Interface extends ABAPObject {

  public getType(): string {
    return "INTF";
  }

  public getDefinition(): InterfaceDefinition | undefined {
    const main = this.getMainABAPFile();
    if (!main) {
      return undefined;
    }
    const definitions = main.getInterfaceDefinitions();
    if (definitions.length === 0) {
      return undefined;
    }
    return definitions[0];
  }

// todo, should this method be moved to abstract class ABAPObject?
  public isGeneratedProxy(): boolean {
    const xml = this.getXML();
    if (!xml) {
      return false;
    }
    const result = xml.match(/<CLSPROXY>(.)<\/CLSPROXY>/);
    if (result) {
      return true;
    } else {
      return false;
    }
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