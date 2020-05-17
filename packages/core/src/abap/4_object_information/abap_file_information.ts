import {ClassDefinition} from "../types/class_definition";
import * as Structures from "../3_structures/structures";
import * as Expressions from "../2_statements/expressions";
import {CurrentScope} from "../5_syntax/_current_scope";
import {IABAPFileInformation} from "./_abap_file_information";
import {StructureNode} from "../nodes";
import {InterfaceDefinition, ClassImplementation} from "../types";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IClassImplementation} from "../types/_class_implementation";
import {Identifier} from "./_identifier";
import * as Tokens from "../1_lexer/tokens";

export class ABAPFileInformation implements IABAPFileInformation {
  private readonly classDefinitions: IClassDefinition[];
  private readonly interfaceDefinitions: IInterfaceDefinition[];
  private readonly classImplementations: IClassImplementation[];
  private readonly forms: Identifier[];

  public constructor(structure: StructureNode | undefined, filename: string) {
    this.classDefinitions = [];
    this.interfaceDefinitions = [];
    this.classImplementations = [];
    this.forms = [];
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

  public listFormDefinitions(): Identifier[] {
    return this.forms;
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

      for (const statement of structure.findAllStructures(Structures.Form)) {
        // FORMs can contain a dash in the name
        const pos = statement.findFirstExpression(Expressions.FormName)!.getFirstToken().getStart();
        const name = statement.findFirstExpression(Expressions.FormName)!.concatTokens();
        const nameToken = new Tokens.Identifier(pos, name);
        this.forms.push(new Identifier(nameToken, filename));
      }
    }
  }

}