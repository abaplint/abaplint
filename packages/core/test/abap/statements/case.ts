import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CASE foobar.",
];

statementType(tests, "CASE", Statements.Case);