import {ABAPObject} from "./_abap_object";
import {StructureNode} from "../abap/nodes";
import * as Structures from "../abap/structures";
import {ClassDefinition} from "../abap/types/class_definition";
import {MethodDefinitions} from "../abap/types/method_definitions";
import {ClassAttributes} from "../abap/types/class_attributes";

export class Class extends ABAPObject {
// todo, add dirty flag so things can be cached?

  public getType(): string {
    return "CLAS";
  }

  public getMainClass(): ClassDefinition | undefined {
    const main = this.getMain();
    if (!main) {
      return undefined;
    }
    const found = main.findFirstStructure(Structures.ClassDefinition);
    if (!found) {
      return undefined;
    }
    return new ClassDefinition(found);
  }

  public getAllClasses(): ClassDefinition[] {
    const main = this.getMainClass();
    const ret = this.getLocalClasses();
    if (main !== undefined) {
      ret.push(main);
    }
    return ret;
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

  public isGeneratedGatewayClass(): boolean {
    if (this.getName().match(/_MPC$/i) && this.getSuperClass() === "/IWBEP/CL_MGW_PUSH_ABS_MODEL") {
      return true;
    }
    if (this.getName().match(/_DPC$/i) && this.getSuperClass() === "/IWBEP/CL_MGW_PUSH_ABS_DATA") {
      return true;
    }
    return false;
  }

// --------------------

  private getMain(): StructureNode | undefined {
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

}