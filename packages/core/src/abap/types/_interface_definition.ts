import {Identifier} from "./_identifier";
import {IAttributes} from "./_class_attributes";
import {ITypeDefinitions} from "./_type_definitions";
import {IMethodDefinition} from "./_method_definition";

export interface IInterfaceDefinition extends Identifier {
  getAttributes(): IAttributes | undefined;
  getTypeDefinitions(): ITypeDefinitions;
  getMethodDefinitions(): IMethodDefinition[];
  isLocal(): boolean;
  isGlobal(): boolean;
}