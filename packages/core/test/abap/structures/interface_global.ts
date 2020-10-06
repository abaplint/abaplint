import {structureType} from "../_utils";
import {InterfaceGlobal} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `TYPE-POOLS abap.
  INTERFACE zif_bar PUBLIC.
  ENDINTERFACE.`},
];

structureType(cases, new InterfaceGlobal());