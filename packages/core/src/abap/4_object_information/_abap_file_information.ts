import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IClassImplementation} from "../types/_class_implementation";
import {IFormDefinition} from "../types/_form_definition";

export interface IABAPFileInformation {
  getClassDefinitions(): readonly IClassDefinition[];
  getClassDefinition(name: string): IClassDefinition | undefined;
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  getInterfaceDefinition(name: string): IInterfaceDefinition | undefined;
  getClassImplementation(name: string): IClassImplementation | undefined;
  getClassImplementations(): readonly IClassImplementation[];
  getFormDefinitions(): readonly IFormDefinition[];
  getFormDefinition(name: string): IFormDefinition | undefined;
}