import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "WHEN OTHERS.",
  "WHEN 'X'.",
  "WHEN bar.",
  "WHEN bar OR foo.",
  "WHEN TYPE cl_bar INTO DATA(bar).",
  "WHEN TYPE zcl_type.",
];

statementType(tests, "WHEN", Statements.When);