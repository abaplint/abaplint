import {ClassDefinition} from "../types/class_definition";

export interface IABAPFileInformation {
  getClassDefinitions(): readonly ClassDefinition[];
  getClassDefinition(name: string): ClassDefinition | undefined;
}