import {Identifier} from "../4_file_information/_identifier";
import {IAttributes} from "./_class_attributes";
import {ITypeDefinitions} from "./_type_definitions";
import {IMethodDefinition} from "./_method_definition";

export interface IInterfaceDefinition extends Identifier {
  getAttributes(): IAttributes;
  getTypeDefinitions(): ITypeDefinitions;
  getMethodDefinitions(): readonly IMethodDefinition[];
  isLocal(): boolean;
  isGlobal(): boolean;
}