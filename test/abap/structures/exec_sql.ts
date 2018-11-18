import {structureType} from "../_utils";
import {ExecSQL} from "../../../src/abap/structures";

const cases = [
  {abap: "EXEC SQL. ENDEXEC."},
  // tod, add test case with native sql
];

structureType(cases, new ExecSQL());