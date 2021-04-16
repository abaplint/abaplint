import {IMethodDefinition} from "./_method_definition";

export interface IMethodDefinitions {
  getAll(): readonly IMethodDefinition[];
  getByName(name: string | undefined): IMethodDefinition | undefined;
}