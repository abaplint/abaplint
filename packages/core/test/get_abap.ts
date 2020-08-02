import {IRegistry} from "../src/_iregistry";
import {ABAPObject} from "../src/objects/_abap_object";

export function getABAPObjects(reg: IRegistry): ABAPObject[] {
  const ret: ABAPObject[] = [];
  for (const o of reg.getObjects()) {
    if (o instanceof ABAPObject) {
      ret.push(o);
    }
  }
  return ret;
}