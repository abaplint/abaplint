import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "CASE foobar.",
  "CASE TYPE OF typedescr.",
];

statementType(tests, "CASE", Statements.Case);