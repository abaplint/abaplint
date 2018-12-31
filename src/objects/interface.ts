import {ABAPObject} from "./_abap_object";
import {InterfaceDefinition} from "../abap/types";
import {ABAPFile} from "../files";

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
    const files = this.getParsedFiles();
    if (files.length > 1) {
      throw new Error("interface.ts, did not expect multiple parsed files");
    }
    return files[0];
  }

}