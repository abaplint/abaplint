import {Visibility} from "./visibility";
import {Identifier} from "../4_object_information/_identifier";
import {IMethodParameters} from "./_method_parameters";

export interface IMethodDefinition extends Identifier {
  getVisibility(): Visibility;
  isRedefinition(): boolean;
  isAbstract(): boolean;
  isStatic(): boolean;
  isEventHandler(): boolean;
  getParameters(): IMethodParameters;
}