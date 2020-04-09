import {Identifier} from "./_identifier";
import {MethodImplementation} from "./method_implementation";

export interface IClassImplementation extends Identifier {
  getMethodImplementations(): MethodImplementation[];
  getMethodImplementation(name: string): MethodImplementation | undefined;
}