import {IAttributes} from "./_class_attributes";
import {Identifier} from "../4_file_information/_identifier";
import {IAliases} from "./_aliases";
import {ITypeDefinitions} from "./_type_definitions";
import {IMethodDefinitions} from "./_method_definitions";
import {IEventDefinition} from "./_event_definition";

export interface IClassDefinition extends Identifier {
  getMethodDefinitions(): IMethodDefinitions;
  getTypeDefinitions(): ITypeDefinitions;
  getSuperClass(): string | undefined;
  getAttributes(): IAttributes;
  isException(): boolean;
  isLocal(): boolean;
  isGlobal(): boolean;
  isFinal(): boolean;
  getImplementing(): readonly {name: string, partial: boolean}[];
  getAliases(): IAliases;
  isForTesting(): boolean;
  isAbstract(): boolean;
  getEvents(): readonly IEventDefinition[];
}