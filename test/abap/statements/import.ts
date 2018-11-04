import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

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
  "IMPORT moo TO boo FROM MEMORY ID id ACCEPTING PADDING.",
  "IMPORT tab = data FROM DATABASE /foo/bar(tg) TO ls_target CLIENT '000' ID lc_id.",
  "IMPORT moo TO boo FROM DATABASE bar(ix) ID idmoo\n" +
  "  ignoring conversion errors\n" +
  "  ignoring structure boundaries.",
  "IMPORT p TO moo FROM SHARED BUFFER indx(a1) ID 'MOO'.",
  "IMPORT moo = ls_boo FROM SHARED BUFFER indx(a1) ID 'BAR'.",
  "IMPORT foo TO bar FROM DATABASE moo(aa) CLIENT lv_client ID lv_id IN CHAR-TO-HEX MODE.",
];

statementType(tests, "IMPORT", Statements.Import);