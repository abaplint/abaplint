import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CHECK lv_var >< 'ABCD'.",
  "CHECK selpernr.",
  "CHECK foo-bar.",
];

statementType(tests, "CHECK", Statements.Check);