import {ClassAttribute} from "./class_attribute";
import {ClassConstant} from "./class_constant";

import {Visibility} from "../4_file_information/visibility";

export interface IAttributes {

  getStatic(): readonly ClassAttribute[];
  getStaticsByVisibility(visibility: Visibility): readonly ClassAttribute[];
  getInstance(): readonly ClassAttribute[];
  getInstancesByVisibility(visibility: Visibility): readonly ClassAttribute[];
  getConstants(): readonly ClassConstant[];
  getConstantsByVisibility(visibility: Visibility): readonly ClassConstant[];
  findByName(name: string): ClassAttribute | ClassConstant | undefined;

}