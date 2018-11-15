import {ABAPObject} from "./_abap_object";
import {StructureNode} from "../abap/nodes";
import {ClassDefinition} from "../abap/types/class_definition";
import {MethodDefinitions} from "../abap/types/method_definitions";
import {ClassAttributes} from "../abap/types/class_attributes";

export class Class extends ABAPObject {

  public getType(): string {
    return "CLAS";
  }

// todo, move some of these methods to ABAPObject?
  public getMainClass(): ClassDefinition {
    return new ClassDefinition(this.getMain());
  }

  public getAllClasses(): ClassDefinition[] {
    throw new Error("todo, getAllClasses");
  }

  public getLocalClasses(): ClassDefinition[] {
    throw new Error("todo, getAllClasses");
  }

// -------------------

  public isException(): boolean {
    return new ClassDefinition(this.getMain()).isException();
  }

  public getSuperClass(): string {
    return new ClassDefinition(this.getMain()).getSuperClass();
  }

  public getMethodDefinitions(): MethodDefinitions {
    return new ClassDefinition(this.getMain()).getMethodDefinitions();
  }

  public getAttributes(): ClassAttributes {
    return new ClassDefinition(this.getMain()).getAttributes();
  }

// todo, add dirty flag so things can be cached

/*
  public getLocalClasses(): ClassDefinition[] {
    return []
  }
*/
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