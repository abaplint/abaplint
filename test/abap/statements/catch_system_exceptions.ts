import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "catch system-exceptions import_mismatch_errors = 1.",
  "CATCH SYSTEM-EXCEPTIONS conversion_errors = zcl_foobar=>const.",
];

statementType(tests, "CATCH SYSTEM-EXCEPTIONS", Statements.CatchSystemExceptions);