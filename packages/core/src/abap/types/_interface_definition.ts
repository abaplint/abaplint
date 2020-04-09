import {Identifier} from "./_identifier";
import {CurrentScope} from "../syntax/_current_scope";
import {IAttributes} from "./_class_attributes";
import {ITypeDefinitions} from "./_type_definitions";
import {IMethodDefinition} from "./_method_definition";

export interface IInterfaceDefinition extends Identifier {
  getAttributes(scope: CurrentScope): IAttributes | undefined;
  getTypeDefinitions(scope: CurrentScope): ITypeDefinitions;
  isLocal(): boolean;
  isGlobal(): boolean;
  getMethodDefinitions(scope: CurrentScope): IMethodDefinition[];
}