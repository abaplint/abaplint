import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "READ TEXTPOOL lv_cp INTO lt_tpool LANGUAGE mv_language.",
  "READ TEXTPOOL lv_cp INTO lt_tpool.",
  "read textpool lv_cp language mv_lang into lt_tpool state 'A'.",
];

statementType(tests, "READ TEXTPOOL", Statements.ReadTextpool);