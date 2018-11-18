import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "CLEANUP INTO l_cx.",
  "CLEANUP.",
];

statementType(tests, "CLEANUP", Statements.Cleanup);