import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "catch cx_foo.",
  "CATCH cx_pak_invalid_data cx_pak_invalid_state.",
  "CATCH /foo/cx_bar INTO lr_/foo/cx_bar.",
  "CATCH BEFORE UNWIND zcx_static_exception.",
];

statementType(tests, "CATCH", Statements.Catch);