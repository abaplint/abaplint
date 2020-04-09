import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";

export interface IABAPFileInformation {
  getClassDefinitions(): readonly IClassDefinition[];
  getClassDefinition(name: string): IClassDefinition | undefined;
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  getInterfaceDefinition(name: string): IInterfaceDefinition | undefined;
}