import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {Identifier} from "./_identifier";
import {Visibility} from "./visibility";

// TODO: Only helper functions to get data from single file, no type information

export interface InfoAttribute {
  name: string,
  identifier: Identifier,
  isStatic: boolean,
  readOnly: boolean,
  visibility: Visibility;
}

export interface InfoMethodDefinition {
  name: string,
  identifier: Identifier,
  isRedefinition: boolean,
  isAbstract: boolean,
  visibility: Visibility,
}

export interface InfoInterfaceDefinition {
  name: string,
  identifier: Identifier;
  isLocal: boolean;
  isGlobal: boolean;
  methods: readonly InfoMethodDefinition[];
// todo, constants
// todo, types
  attributes: readonly InfoAttribute[];
}

export interface InfoClassDefinition extends InfoInterfaceDefinition {
  superClassName: string | undefined;
  isAbstract: boolean;
  isFinal: boolean;
  isException: boolean;
}

export interface InfoClassImplementation {
  name: string,
  identifier: Identifier;
  methods: readonly Identifier[];
}

export interface IABAPFileInformation {
  // TODO, remove these
  getClassDefinitions(): readonly IClassDefinition[];
//  getClassDefinition(name: string): IClassDefinition | undefined;
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  getInterfaceDefinition(name: string): IInterfaceDefinition | undefined;

  // WIP
  listInterfaceDefinitions(): readonly InfoInterfaceDefinition[];
  getInterfaceDefinitionByName(name: string): InfoInterfaceDefinition | undefined;
  listClassDefinitions(): readonly InfoClassDefinition[];
  getClassDefinitionByName(name: string): InfoClassDefinition | undefined;

  // OK
  listFormDefinitions(): readonly Identifier[];
  listClassImplementations(): readonly InfoClassImplementation[];
  getClassImplementationByName(name: string): InfoClassImplementation | undefined;
}