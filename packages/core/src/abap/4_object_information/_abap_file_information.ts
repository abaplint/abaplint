import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IClassImplementation} from "../types/_class_implementation";
import {Identifier} from "./_identifier";

// TODO: Only helper functions to get data from single file, no typing

export interface IABAPFileInformation {
  // TODO
  getClassDefinitions(): readonly IClassDefinition[];
  getClassDefinition(name: string): IClassDefinition | undefined;
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  getInterfaceDefinition(name: string): IInterfaceDefinition | undefined;
  getClassImplementation(name: string): IClassImplementation | undefined;
  getClassImplementations(): readonly IClassImplementation[];

  // OK
  listFormDefinitions(): Identifier[];
}