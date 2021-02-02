import {structureType} from "../_utils";
import {InterfaceGlobal} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `TYPE-POOLS abap.
  INTERFACE zif_bar PUBLIC.
  ENDINTERFACE.`},
  {abap: `INTERFACE zif_bar PUBLIC.
  TYPES: BEGIN OF bar,
  foo TYPE i,
  END OF bar.
  ENDINTERFACE.`},
];

structureType(cases, new InterfaceGlobal());