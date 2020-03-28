import {structureType} from "../_utils";
import {Loop} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "LOOP AT tab INTO stru. ENDLOOP."},
  {abap: "LOOP AT tab INTO stru. WRITE bar. ENDLOOP."},
];

structureType(cases, new Loop());