import {IInterfaceDefinition} from "./_interface_definition";

export interface IClassDefinition extends IInterfaceDefinition {
  isException(): boolean;
  isFinal(): boolean;
  isForTesting(): boolean;
  isAbstract(): boolean;
}