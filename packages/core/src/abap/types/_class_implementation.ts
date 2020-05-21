import {Identifier} from "../4_file_information/_identifier";
import {MethodImplementation} from "./method_implementation";

export interface IClassImplementation extends Identifier {
  getMethodImplementations(): MethodImplementation[];
  getMethodImplementation(name: string): MethodImplementation | undefined;
}