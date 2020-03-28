import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CASE foobar.",
  "CASE TYPE OF typedescr.",
];

statementType(tests, "CASE", Statements.Case);