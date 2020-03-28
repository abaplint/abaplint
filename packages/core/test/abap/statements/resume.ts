import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "RESUME.",
];

statementType(tests, "RESUME", Statements.Resume);