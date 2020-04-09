import {IMethodDefinition} from "./_method_definition";

export interface IMethodDefinitions {
  getPublic(): readonly IMethodDefinition[];
  getProtected(): readonly IMethodDefinition[];
  getPrivate(): readonly IMethodDefinition[];
  getAll(): readonly IMethodDefinition[];
}