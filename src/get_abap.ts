import {IRegistry} from "./_iregistry";
import {ABAPObject} from "./objects/_abap_object";

// todo, remove this?
export function getABAPObjects(reg: IRegistry): ABAPObject[] {
  return reg.getObjects().filter((obj) => { return obj instanceof ABAPObject; }) as ABAPObject[];
}