import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "WHEN TYPE cl_bar INTO DATA(bar).",
  "WHEN TYPE zcl_type.",
];

statementType(tests, "WHEN TYPE", Statements.WhenType);