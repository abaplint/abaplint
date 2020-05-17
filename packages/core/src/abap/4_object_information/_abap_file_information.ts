import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {Identifier} from "./_identifier";
import {Visibility} from "./visibility";

// TODO: Only helper functions to get data from single file, no type information

export enum AttributeType {
  Instance,
  Static,
  Constant,
}

export interface InfoAttribute {
  name: string,
  identifier: Identifier,
  type: AttributeType,
  readOnly: boolean,
  visibility: Visibility,
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

export interface InfoAlias {
  name: string,
  identifier: Identifier;
  visibility: Visibility,
  component: string
}

export interface InfoClassDefinition extends InfoInterfaceDefinition {
  superClassName: string | undefined;
  isAbstract: boolean;
  isFinal: boolean;
  interfaces: readonly {name: string, partial: boolean}[];
  isForTesting: boolean;
  isException: boolean;
  aliases: readonly InfoAlias[],
}

export interface InfoClassImplementation {
  name: string,
  identifier: Identifier;
  methods: readonly Identifier[];
}

export interface IABAPFileInformation {
  // TODO, remove these
  getClassDefinitions(): readonly IClassDefinition[];
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  // ^END TODO

  listInterfaceDefinitions(): readonly InfoInterfaceDefinition[];
  getInterfaceDefinitionByName(name: string): InfoInterfaceDefinition | undefined;
  listClassDefinitions(): readonly InfoClassDefinition[];
  getClassDefinitionByName(name: string): InfoClassDefinition | undefined;
  listFormDefinitions(): readonly Identifier[];
  listClassImplementations(): readonly InfoClassImplementation[];
  getClassImplementationByName(name: string): InfoClassImplementation | undefined;
}