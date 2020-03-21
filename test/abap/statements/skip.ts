import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SKIP.",
  "SKIP TO LINE 12.",
  "SKIP 1.",
];

statementType(tests, "SKIP", Statements.Skip);