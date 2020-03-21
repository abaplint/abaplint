import {structureType} from "../_utils";
import {Do} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "DO 2 TIMES. ENDDO."},
  {abap: "DO 2 TIMES. WRITE bar. ENDDO."},
];

structureType(cases, new Do());