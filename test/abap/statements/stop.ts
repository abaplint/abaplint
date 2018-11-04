import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "STOP.",
];

statementType(tests, "STOP", Statements.Stop);