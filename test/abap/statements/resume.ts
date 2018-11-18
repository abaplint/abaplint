import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "RESUME.",
];

statementType(tests, "RESUME", Statements.Resume);