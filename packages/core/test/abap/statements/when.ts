import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "WHEN 'X'.",
  "WHEN bar.",
  "WHEN bar OR foo.",
];

statementType(tests, "WHEN", Statements.When);