import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "HIDE gv_field.",
];

statementType(tests, "HIDE", Statements.Hide);