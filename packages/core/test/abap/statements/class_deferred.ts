import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CLASS lcl_gui DEFINITION DEFERRED.",
  "CLASS zcl_foo DEFINITION DEFERRED PUBLIC.",
  "CLASS LCL_/foo/bar DEFINITION DEFERRED.",
];

statementType(tests, "CLASS other", Statements.ClassDeferred);