import {structureType} from "../../utils";
import {Do} from "../../../src/abap/structures";

let cases = [
  {abap: "DO 2 TIMES. ENDDO."},
  {abap: "DO 2 TIMES. WRITE bar. ENDDO."},
];

structureType(cases, new Do());