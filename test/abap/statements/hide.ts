import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "HIDE gv_field.",
  "HIDE foobar#.",
];

statementType(tests, "HIDE", Statements.Hide);