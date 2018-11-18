import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "DELETE TEXTPOOL ls_foo-name.",
  "DELETE TEXTPOOL iv_program LANGUAGE iv_program STATE lv_state.",
  "DELETE TEXTPOOL lv_pool LANGUAGE '*'.",
];

statementType(tests, "DELETE TEXTPOOL", Statements.DeleteTextpool);