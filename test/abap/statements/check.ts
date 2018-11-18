import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "CHECK lv_var >< 'ABCD'.",
];

statementType(tests, "CHECK", Statements.Check);