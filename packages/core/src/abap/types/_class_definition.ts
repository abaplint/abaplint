import {IAttributes} from "./_class_attributes";
import {Identifier} from "../4_file_information/_identifier";
import {IAliases} from "./_aliases";
import {ITypeDefinitions} from "./_type_definitions";
import {IEventDefinition} from "./_event_definition";
import {IMethodDefinitions} from "./_method_definitions";

export interface IClassDefinition extends Identifier {
  getAttributes(): IAttributes;
  getTypeDefinitions(): ITypeDefinitions;
  getMethodDefinitions(): IMethodDefinitions;
  getEvents(): readonly IEventDefinition[];
  isLocal(): boolean;
  isGlobal(): boolean;

  getSuperClass(): string | undefined;
  isException(): boolean;
  isFinal(): boolean;
  getImplementing(): readonly {name: string, partial: boolean}[];
  getAliases(): IAliases;
  isForTesting(): boolean;
  isAbstract(): boolean;
}