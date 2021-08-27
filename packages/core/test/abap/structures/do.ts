import {structureType} from "../_utils";
import {Do} from "../../../src/abap/3_structures/structures";

const cases = [
  {abap: "DO 2 TIMES. ENDDO."},
  {abap: "DO 2 TIMES. WRITE bar. ENDDO."},
  {abap: "DO 2 TIMES. MOVE-CORRESPONDING foo TO bar. ENDDO."},
  {abap: "DO 2 TIMES. MODIFY SCREEN. ENDDO."},
  {abap: "DO 2 TIMES. INSERT 'sdf' 'sdf' INTO header. ENDDO."},
];

structureType(cases, new Do());