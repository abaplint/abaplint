import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FIELD sdfds MODULE sdfs ON INPUT.",
  "FIELD sdfds MODULE sdfs.",
];

statementType(tests, "FIELD", Statements.Field);