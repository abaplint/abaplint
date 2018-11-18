import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SUPPLY foo = bar TO CONTEXT ctx.",
];

statementType(tests, "SUPPLY", Statements.Supply);