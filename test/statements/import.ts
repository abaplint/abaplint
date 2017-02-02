import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "IMPORT foo TO bar FROM MEMORY ID 'MOO'.",
  "IMPORT p1 = ls_option FROM DATABASE indx(xl) TO ws_indx ID ws_indx-srtfd.",
  "IMPORT (lt_export) FROM DATA BUFFER cv_attributes.",
  "import l_foo from database ltdx(XL) id 'foobar'.",
  "import field1 field2 field3 from database foobar(sv) id func_key \n" +
    "accepting padding IGNORING CONVERSION ERRORS ACCEPTING TRUNCATION.",
  "IMPORT mv_errty = mv_errty FROM DATA BUFFER p_attributes.",
  "IMPORT dir INTO dir FROM DATABASE bar(ix) ID foo TO moo.",
  "IMPORT foo = bar[] FROM INTERNAL TABLE tab.",
  "IMPORT data TO lt_data FROM SHARED MEMORY indx(aa) ID lv_key.",
  "IMPORT tab = data FROM DATABASE /foo/bar(tg) TO ls_target CLIENT '000' ID lc_id.",
];

statementType(tests, "IMPORT", Statements.Import);