import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "LOAD-OF-PROGRAM.",
];

statementType(tests, "LOAD-OF-PROGRAM", Statements.LoadOfProgram);