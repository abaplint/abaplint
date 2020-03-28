import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "STOP.",
];

statementType(tests, "STOP", Statements.Stop);