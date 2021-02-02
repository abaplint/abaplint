import {structureType} from "../_utils";
import {InterfaceGlobal} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: `TYPE-POOLS abap.
  INTERFACE zif_bar PUBLIC.
  ENDINTERFACE.`},
  {abap: `INTERFACE zif_bar PUBLIC.
  TYPES: BEGIN OF bar,
  foo1 TYPE i,
  foo2 TYPE i,
  foo3 TYPE i,
  foo4 TYPE i,
  END OF bar.
  METHODS bar.
  ENDINTERFACE.`},
];

structureType(cases, new InterfaceGlobal());