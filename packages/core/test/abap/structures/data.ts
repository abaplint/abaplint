import {structureType} from "../_utils";
import {Data} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "DATA: BEGIN OF name, foo TYPE string, bar TYPE string, END OF name."},
];

structureType(cases, new Data());