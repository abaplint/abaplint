import {ClassDefinition} from "../types/class_definition";
import * as Structures from "../3_structures/structures";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IABAPFileInformation} from "./_abap_file_information";
import {StructureNode} from "../nodes";
import {InterfaceDefinition, ClassImplementation, FormDefinition} from "../types";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IClassImplementation} from "../types/_class_implementation";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly classDefinitions: IClassDefinition[];
  private readonly interfaceDefinitions: IInterfaceDefinition[];
  private readonly classImplementations: IClassImplementation[];
  private readonly formDefinitions: FormDefinition[];

  public constructor(structure: StructureNode | undefined, filename: string) {
    this.classDefinitions = [];
    this.interfaceDefinitions = [];
    this.classImplementations = [];
    this.formDefinitions = [];
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

  public getInterfaceDefinitions() {
    return this.interfaceDefinitions;
  }

  public getInterfaceDefinition(name: string) {
    for (const def of this.getInterfaceDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

  public getClassImplementation(name: string) {
    for (const impl of this.getClassImplementations()) {
      if (impl.getName().toUpperCase() === name.toUpperCase()) {
        return impl;
      }
    }
    return undefined;
  }

  public getClassImplementations() {
    return this.classImplementations;
  }

  public getFormDefinitions(): FormDefinition[] {
    return this.formDefinitions;
  }

  public getFormDefinition(name: string): FormDefinition | undefined {
    for (const def of this.getFormDefinitions()) {
      if (def.getName().toUpperCase() === name.toUpperCase()) {
        return def;
      }
    }
    return undefined;
  }

///////////////////////

  private parse(structure: StructureNode | undefined, filename: string): void {
    const scope = CurrentScope.buildEmpty();

    if (structure !== undefined) {
      for (const found of structure.findAllStructures(Structures.ClassDefinition)) {
        this.classDefinitions.push(new ClassDefinition(found, filename, scope));
      }

      for (const found of structure.findAllStructures(Structures.Interface)) {
        this.interfaceDefinitions.push(new InterfaceDefinition(found, filename, scope));
      }

      for (const found of structure.findAllStructures(Structures.ClassImplementation)) {
        this.classImplementations.push(new ClassImplementation(found, filename));
      }

      for (const found of structure.findAllStructures(Structures.Form)) {
        this.formDefinitions.push(new FormDefinition(found, filename, scope));
      }
    }
  }

}