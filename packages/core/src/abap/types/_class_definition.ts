import {IInterfaceDefinition} from "./_interface_definition";
import {Visibility} from "../4_file_information/visibility";

export interface IClassDefinition extends IInterfaceDefinition {
  isFinal(): boolean;
  isForTesting(): boolean;
  isAbstract(): boolean;
  isSharedMemory(): boolean;
  getFriends(): string[];
  getCreateVisibility(): Visibility;
}