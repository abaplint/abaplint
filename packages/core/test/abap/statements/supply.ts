import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SUPPLY foo = bar TO CONTEXT ctx.",
];

statementType(tests, "SUPPLY", Statements.Supply);