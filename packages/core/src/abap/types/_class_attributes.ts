import {ClassAttribute} from "./class_attribute";
import {ClassConstant} from "./class_constant";
import {Visibility} from "../4_file_information/visibility";
import {ITypeDefinitions} from "./_type_definitions";

export interface IAttributes {
  getStatic(): readonly ClassAttribute[];
  getStaticsByVisibility(visibility: Visibility): readonly ClassAttribute[];
  getInstance(): readonly ClassAttribute[];
  getInstancesByVisibility(visibility: Visibility): readonly ClassAttribute[];
  getConstantsByVisibility(visibility: Visibility): readonly ClassConstant[];
  findByName(name: string): ClassAttribute | ClassConstant | undefined;

  getConstants(): readonly ClassConstant[];
  getAll(): readonly ClassAttribute[];
  getTypes(): ITypeDefinitions;
}