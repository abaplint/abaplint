import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {Identifier} from "./_identifier";

// TODO: Only helper functions to get data from single file, no typing

export interface IClassAndMethods {
  name: Identifier;
  methods: Identifier[];
}

export interface IABAPFileInformation {
  // TODO
  getClassDefinitions(): readonly IClassDefinition[];
  getClassDefinition(name: string): IClassDefinition | undefined;
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  getInterfaceDefinition(name: string): IInterfaceDefinition | undefined;

  // OK
  listFormDefinitions(): readonly Identifier[];
  listClassImplementations(): readonly IClassAndMethods[];
  getClassImplementationByName(name: string): IClassAndMethods | undefined;
}