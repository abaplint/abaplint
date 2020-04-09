import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IClassImplementation} from "../types/_class_implementation";
import {FormDefinition} from "../types/form_definition";

export interface IABAPFileInformation {
  getClassDefinitions(): readonly IClassDefinition[];
  getClassDefinition(name: string): IClassDefinition | undefined;
  getInterfaceDefinitions(): readonly IInterfaceDefinition[];
  getInterfaceDefinition(name: string): IInterfaceDefinition | undefined;
  getClassImplementation(name: string): IClassImplementation | undefined;
  getClassImplementations(): readonly IClassImplementation[];
  getFormDefinitions(): readonly FormDefinition[];
  getFormDefinition(name: string): FormDefinition | undefined;
}