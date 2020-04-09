import {ClassDefinition} from "../types/class_definition";
import * as Structures from "../3_structures/structures";
import {CurrentScope} from "../syntax/_current_scope";
import {IABAPFileInformation} from "./_abap_file_information";
import {StructureNode} from "../nodes";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly classDefinitions: ClassDefinition[];

  public constructor(structure: StructureNode | undefined, filename: string) {
    this.classDefinitions = [];
    this.parse(structure, filename);
  }

  public getClassDefinitions(): readonly ClassDefinition[] {
    return this.classDefinitions;
  }

  public getClassDefinition(name: string): ClassDefinition | undefined {
    for (const def of this.getClassDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

///////////////////////

  private parse(structure: StructureNode | undefined, filename: string) {
    const scope = CurrentScope.buildEmpty();

    if (structure !== undefined) {
      for (const found of structure.findAllStructures(Structures.ClassDefinition)) {
        this.classDefinitions.push(new ClassDefinition(found, filename, scope));
      }
    }
  }

}