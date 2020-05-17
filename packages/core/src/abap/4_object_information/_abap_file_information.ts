import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {Identifier} from "./_identifier";
import {Visibility} from "./visibility";

// TODO: Only helper functions to get data from single file, no typing

export interface InfoAttribute {
  name: Identifier,
  static: boolean,
  readOnly: boolean,
  visibility: Visibility;
}

export interface InfoMethodDefinition {
  name: Identifier,
  isRedefinition: boolean,
  visibility: Visibility,
}

export interface InfoObjectDefinition {
  name: Identifier;
  isLocal: boolean;
  methods: InfoMethodDefinition[];
  attributes: InfoAttribute[];
}

export interface InfoClassImplementation {
  name: Identifier;
  methods: Identifier[];
}

export interface IABAPFileInformation {
  // TODO, remove these
  getClassDefinitions(): readonly IClassDefinition[];
  getClassDefinition(name: string): IClassDefinition | undefined;
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  getInterfaceDefinition(name: string): IInterfaceDefinition | undefined;

  // WIP
  listInterfaceDefinitions(): readonly InfoObjectDefinition[];
  getInterfaceDefinitionByName(name: string): InfoObjectDefinition | undefined;
  listClassDefinitions(): readonly InfoObjectDefinition[];
  getClassDefinitionByName(name: string): InfoObjectDefinition | undefined;

  // OK
  listFormDefinitions(): readonly Identifier[];
  listClassImplementations(): readonly InfoClassImplementation[];
  getClassImplementationByName(name: string): InfoClassImplementation | undefined;
}