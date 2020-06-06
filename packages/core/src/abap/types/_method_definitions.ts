import {IMethodDefinition} from "./_method_definition";

export interface IMethodDefinitions {
  getPublic(): readonly IMethodDefinition[];
  getProtected(): readonly IMethodDefinition[];
  getPrivate(): readonly IMethodDefinition[];
  getAll(): readonly IMethodDefinition[];
  getByName(name: string | undefined): IMethodDefinition | undefined;
}