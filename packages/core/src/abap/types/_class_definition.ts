import {IInterfaceDefinition} from "./_interface_definition";

export interface IClassDefinition extends IInterfaceDefinition {
  isException(): boolean;
  isFinal(): boolean;
  getImplementing(): readonly {name: string, partial: boolean}[];
  isForTesting(): boolean;
  isAbstract(): boolean;
}