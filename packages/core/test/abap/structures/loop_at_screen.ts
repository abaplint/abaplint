import {structureType} from "../_utils";
import {LoopAtScreen} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "LOOP AT SCREEN. ENDLOOP."},
  {abap: "LOOP AT SCREEN. WRITE bar. ENDLOOP."},
];

structureType(cases, new LoopAtScreen());