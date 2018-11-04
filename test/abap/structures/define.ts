import {structureType} from "../../_utils";
import {Define} from "../../../src/abap/structures";

let cases = [
  {abap: "DEFINE _macro. END-OF-DEFINITION."},
  {abap: "DEFINE _macro. WRITE bar. END-OF-DEFINITION."},
];

structureType(cases, new Define());