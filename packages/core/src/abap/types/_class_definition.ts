import {IAliases} from "./_aliases";
import {IInterfaceDefinition} from "./_interface_definition";

export interface IClassDefinition extends IInterfaceDefinition {
  getSuperClass(): string | undefined;
  isException(): boolean;
  isFinal(): boolean;
  getImplementing(): readonly {name: string, partial: boolean}[];
  getAliases(): IAliases;
  isForTesting(): boolean;
  isAbstract(): boolean;
}