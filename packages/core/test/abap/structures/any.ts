import {structureType} from "../_utils";
import {Any} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: ""},
  {abap: "WRITE foo. WRITE bar."},
  {abap: "WRITE foo. DATA i TYPE i."},
  {abap: "IF 1 = 2. WRITE foo. WRITE bar. ENDIF."},
];

structureType(cases, new Any());