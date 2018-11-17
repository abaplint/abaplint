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

  public getMainClass(): ClassDefinition {
    if (!this.getMain()) {
      return undefined;
    }
    return new ClassDefinition(this.getMain().findFirstStructure(Structures.ClassDefinition));
  }

  public getAllClasses(): ClassDefinition[] {
    return this.getLocalClasses().concat(this.getMainClass());
  }

  public getLocalClasses(): ClassDefinition[] {
    let ret: ClassDefinition[] = [];
    for (let file of this.getParsedFiles()) {
      let nodes = file.getStructure().findAllStructures(Structures.ClassDefinition);
      for (let node of nodes) {
        ret.push(new ClassDefinition(node));
      }
    }
    return ret;
  }

// -------------------

  public isException(): boolean | undefined  {
    if (!this.getMainClass()) { return undefined; }
    return this.getMainClass().isException();
  }

  public getSuperClass(): string | undefined  {
    if (!this.getMainClass()) { return undefined; }
    return this.getMainClass().getSuperClass();
  }

  public getMethodDefinitions(): MethodDefinitions | undefined  {
    if (!this.getMainClass()) { return undefined; }
    return this.getMainClass().getMethodDefinitions();
  }

  public getAttributes(): ClassAttributes | undefined {
    if (!this.getMainClass()) { return undefined; }
    return this.getMainClass().getAttributes();
  }

// --------------------

  private getMain(): StructureNode {
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