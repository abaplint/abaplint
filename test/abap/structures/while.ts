import {structureType} from "../_utils";
import {While} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "WHILE foo = bar. ENDWHILE."},
  {abap: "WHILE foo = bar. WRITE bar. ENDWHILE."},
];

structureType(cases, new While());