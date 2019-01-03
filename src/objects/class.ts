import {ABAPObject} from "./_abap_object";
import {ClassDefinition} from "../abap/types/class_definition";
import {ABAPFile} from "../files";

export enum ClassCategory {
  Test = "05",
  Persistent = "10",
  PersistentFactory = "11",
  Exception = "40",
  SharedObject = "45",
}

export class Class extends ABAPObject {
// todo, add dirty flag so things can be cached?

  public getType(): string {
    return "CLAS";
  }

// todo, rename to "getDefinition" ?
  public getClassDefinition(): ClassDefinition | undefined {
    const main = this.getMainABAP();
    if (!main) {
      return undefined;
    }
    const definitions = main.getClassDefinitions();
    if (definitions.length === 0) {
      return undefined;
    }
    return definitions[0];
  }

  /*
  public getLocalClasses(): ClassDefinition[] {
    const ret: ClassDefinition[] = [];
    for (const file of this.getParsedFiles()) {
      const stru = file.getStructure();
      if (stru) {
        const nodes = stru.findAllStructures(Structures.ClassDefinition);
        for (const node of nodes) {
          ret.push(new ClassDefinition(node));
        }
      }
    }
    return ret;
  }
 */

// -------------------

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

// --------------------

  private getMainABAP(): ABAPFile | undefined {
// todo, overrride addFile instead of looping through it again?
    const files = this.getABAPFiles();
    for (const file of files) {
      if (file.getFilename().match(/\.clas\.abap$/i)) {
        return file;
      }
    }
    if (files.length === 0) {
      throw new Error("class.ts, getMain: Could not find main file, parsed empty");
    } else {
      throw new Error("class.ts, getMain: Could not find main file");
    }
  }

  private getXML(): string | undefined {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.clas\.xml$/i)) {
        return file.getRaw();
      }
    }
    return undefined;
  }

}