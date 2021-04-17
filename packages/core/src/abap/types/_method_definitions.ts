import {IMethodDefinition} from "./_method_definition";

export interface IMethodDefinitions {
  getAll(): Generator<IMethodDefinition, void, undefined>;
  getByName(name: string | undefined): IMethodDefinition | undefined;
}