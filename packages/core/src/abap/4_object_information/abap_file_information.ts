import {ClassDefinition} from "../types/class_definition";
import * as Structures from "../3_structures/structures";
import {CurrentScope} from "../syntax/_current_scope";
import {IABAPFileInformation} from "./_abap_file_information";
import {StructureNode} from "../nodes";
import {InterfaceDefinition} from "../types";
import {IClassDefinition} from "../types/_class_definition";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly classDefinitions: IClassDefinition[];
  private readonly interfaceDefinitions: InterfaceDefinition[];

  public constructor(structure: StructureNode | undefined, filename: string) {
    this.classDefinitions = [];
    this.interfaceDefinitions = [];
    this.parse(structure, filename);
  }

  public getClassDefinitions() {
    return this.classDefinitions;
  }

  public getClassDefinition(name: string) {
    for (const def of this.getClassDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

  public getInterfaceDefinitions(): InterfaceDefinition[] {
    return this.interfaceDefinitions;
  }

  public getInterfaceDefinition(name: string): InterfaceDefinition | undefined {
    for (const def of this.getInterfaceDefinitions()) {
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

      for (const found of structure.findAllStructures(Structures.Interface)) {
        this.interfaceDefinitions.push(new InterfaceDefinition(found, filename));
      }

    }
  }

}