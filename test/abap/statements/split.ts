import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SPLIT iv_data AT gc_newline INTO TABLE lt_result.",
  "SPLIT iv_data AT gc_newline INTO TABLE lt_result IN CHARACTER MODE.",
  "SPLIT ls_raw-body AT gc_newline INTO ls_commit-message lv_trash.",
];

statementType(tests, "SPLIT", Statements.Split);