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
    let main = this.getMain();
    if (!main) {
      return undefined;
    }
    let found = main.findFirstStructure(Structures.ClassDefinition);
    if (!found) {
      return undefined;
    }
    return new ClassDefinition(found);
  }

  public getAllClasses(): ClassDefinition[] {
    let main = this.getMainClass();
    let ret = this.getLocalClasses();
    if (main !== undefined) {
      ret.push(main);
    }
    return ret;
  }

  public getLocalClasses(): ClassDefinition[] {
    let ret: ClassDefinition[] = [];
    for (let file of this.getParsedFiles()) {
      let stru = file.getStructure();
      if (stru) {
        let nodes = stru.findAllStructures(Structures.ClassDefinition);
        for (let node of nodes) {
          ret.push(new ClassDefinition(node));
        }
      }
    }
    return ret;
  }

// -------------------

  public isException(): boolean | undefined  {
    let main = this.getMainClass();
    if (!main) { return undefined; }
    return main.isException();
  }

  public getSuperClass(): string | undefined  {
    let main = this.getMainClass();
    if (!main) { return undefined; }
    return main.getSuperClass();
  }

  public getMethodDefinitions(): MethodDefinitions | undefined  {
    let main = this.getMainClass();
    if (!main) { return undefined; }
    return main.getMethodDefinitions();
  }

  public getAttributes(): ClassAttributes | undefined {
    let main = this.getMainClass();
    if (!main) { return undefined; }
    return main.getAttributes();
  }

// --------------------

  private getMain(): StructureNode | undefined {
// todo, overrride addFile instead of looping through it again?
    const files = this.getParsedFiles();
    for (let file of files) {
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