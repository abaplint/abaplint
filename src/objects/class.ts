import {ABAPObject} from "./_abap_object";
import {StructureNode} from "../abap/nodes";
import * as Structures from "../abap/structures";
import {ClassDefinition} from "../abap/types/class_definition";
import {MethodDefinitions} from "../abap/types/method_definitions";
import {ClassAttributes} from "../abap/types/class_attributes";

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

// todo, rename to "getClass" ?
  public getMainClass(): ClassDefinition | undefined {
    const main = this.getMainABAP();
    if (!main) {
      return undefined;
    }
    const found = main.findFirstStructure(Structures.ClassDefinition);
    if (!found) {
      return undefined;
    }
    return new ClassDefinition(found);
  }

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

// -------------------

  public isException(): boolean | undefined  {
    const main = this.getMainClass();
    if (!main) { return undefined; }
    return main.isException();
  }

  public getSuperClass(): string | undefined  {
    const main = this.getMainClass();
    if (!main) { return undefined; }
    return main.getSuperClass();
  }

  public getMethodDefinitions(): MethodDefinitions | undefined  {
    const main = this.getMainClass();
    if (!main) { return undefined; }
    return main.getMethodDefinitions();
  }

  public getAttributes(): ClassAttributes | undefined {
    const main = this.getMainClass();
    if (!main) { return undefined; }
    return main.getAttributes();
  }

// -------------------

  public getCategory(): string | undefined {
    const result = this.getXML().match(/<CATEGORY>(\d{2})<\/CATEGORY>/);
    if (result) {
// https://blog.mariusschulz.com/2017/10/27/typescript-2-4-string-enums#no-reverse-mapping-for-string-valued-enum-members
      return result[1];
    } else {
      return undefined;
    }
  }

// --------------------

  private getMainABAP(): StructureNode | undefined {
// todo, overrride addFile instead of looping through it again?
    const files = this.getParsedFiles();
    for (const file of files) {
      if (file.getFilename().match(/\.clas\.abap$/i)) {
        return file.getStructure();
      }
    }
    if (files.length === 0) {
      throw new Error("class.ts, getMain: Could not find main file, parsed empty");
    } else {
      throw new Error("class.ts, getMain: Could not find main file");
    }
  }

  private getXML(): string {
    for (const file of this.getFiles()) {
      if (file.getFilename().match(/\.clas\.xml$/i)) {
        return file.getRaw();
      }
    }
    throw new Error("class.ts: XML file not found for class " + this.getName());
  }

}