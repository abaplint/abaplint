import {structureType} from "../_utils";
import {ExecSQL} from "../../../src/abap/structures";

let cases = [
  {abap: "EXEC SQL. ENDEXEC."},
  // tod, add test case with native sql
];

structureType(cases, new ExecSQL());