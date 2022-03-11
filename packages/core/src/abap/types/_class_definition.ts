import {IInterfaceDefinition} from "./_interface_definition";

export interface IClassDefinition extends IInterfaceDefinition {
  isFinal(): boolean;
  isForTesting(): boolean;
  isAbstract(): boolean;
  isSharedMemory(): boolean;
  getFriends(): string[];
}