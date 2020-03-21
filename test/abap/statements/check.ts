import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CHECK lv_var >< 'ABCD'.",
];

statementType(tests, "CHECK", Statements.Check);