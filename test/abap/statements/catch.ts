import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "catch cx_foo.",
  "CATCH cx_pak_invalid_data cx_pak_invalid_state.",
  "CATCH /foo/cx_bar INTO lr_/foo/cx_bar.",
];

statementType(tests, "CATCH", Statements.Catch);