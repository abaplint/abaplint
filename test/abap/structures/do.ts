import {structureType} from "../_utils";
import {Do} from "../../../src/abap/structures";

const cases = [
  {abap: "DO 2 TIMES. ENDDO."},
  {abap: "DO 2 TIMES. WRITE bar. ENDDO."},
];

structureType(cases, new Do());