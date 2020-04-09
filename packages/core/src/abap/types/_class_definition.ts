import {IAttributes} from "./_class_attributes";
import {Identifier} from "./_identifier";
import {IAliases} from "./_aliases";
import {ITypeDefinitions} from "./_type_definitions";
import {IMethodDefinitions} from "./_method_definitions";

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
}