import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "STOP.",
];

statementType(tests, "STOP", Statements.Stop);