import {IRegistry} from "../src/_iregistry";
import {ABAPObject} from "../src/objects/_abap_object";

export function getABAPObjects(reg: IRegistry): ABAPObject[] {
  return reg.getObjects().filter(ABAPObject.is);
}