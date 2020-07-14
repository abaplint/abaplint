import {Identifier} from "./_identifier";
import {Visibility} from "./visibility";

// Only helper functions to get data from single file, no type information

export enum AttributeLevel {
  Instance = "instance",
  Static = "static",
  Constant = "constant",
}

export enum MethodParameterDirection {
  Importing = "importing",
  Exporting = "exporting",
  Changing = "changing",
  Returning = "returning",
}

export interface InfoAttribute {
  name: string,
  identifier: Identifier,
  level: AttributeLevel,
  readOnly: boolean,
  visibility: Visibility,
}

export interface InfoMethodParameter {
  name: string,
  identifier: Identifier,
  direction: MethodParameterDirection,
}

export interface InfoMethodDefinition {
  name: string,
  identifier: Identifier,
// todo, level, Instance or Static
  isRedefinition: boolean,
  isEventHandler: boolean,
  isAbstract: boolean,
  visibility: Visibility,
  parameters: InfoMethodParameter[],
  exceptions: string[],
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

export interface InfoImplementing {
  name: string,
  partial: boolean
}

export interface InfoClassDefinition extends InfoInterfaceDefinition {
  superClassName: string | undefined;
  isAbstract: boolean;
  isFinal: boolean;
  interfaces: readonly InfoImplementing[];
  isForTesting: boolean;
  aliases: readonly InfoAlias[],
}

export interface InfoClassImplementation {
  name: string,
  identifier: Identifier;
  methods: readonly Identifier[];
}

export interface InfoFormDefinition {
  name: string,
  identifier: Identifier;
}

export interface IABAPFileInformation {
  listInterfaceDefinitions(): readonly InfoInterfaceDefinition[];
  getInterfaceDefinitionByName(name: string): InfoInterfaceDefinition | undefined;
  listClassDefinitions(): readonly InfoClassDefinition[];
  getClassDefinitionByName(name: string): InfoClassDefinition | undefined;
  listFormDefinitions(): readonly InfoFormDefinition[];
  listClassImplementations(): readonly InfoClassImplementation[];
  getClassImplementationByName(name: string): InfoClassImplementation | undefined;
}