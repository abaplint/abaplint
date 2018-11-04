import {structureType} from "../_utils";
import {While} from "../../../src/abap/structures";

let cases = [
  {abap: "WHILE foo = bar. ENDWHILE."},
  {abap: "WHILE foo = bar. WRITE bar. ENDWHILE."},
];

structureType(cases, new While());