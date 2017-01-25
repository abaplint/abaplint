import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EXPORT foo TO MEMORY ID 'MOO'.",
  "EXPORT list = it_list TO DATA BUFFER lv_xstring COMPRESSION ON.",
  "EXPORT mv_errty = mv_errty TO DATA BUFFER p_attributes.",
  "EXPORT (lt_export) TO DATA BUFFER lv_attributes.",
  "EXPORT lt_table1 lt_table2 TO MEMORY ID L_MEMID.",
  "export lt_dump to database LTCX(LT) id ls_key.",
  "EXPORT p1 = is_option TO DATABASE indx(xl) FROM ws_indx ID ws_indx-srtfd.",
  "EXPORT tab = tab TO DATABASE foo(tx) ID bar FROM moo.",
  "EXPORT foo = lt_foo TO DATABASE indx(rt) FROM indx_wa CLIENT sy-mandt ID lv_id.",
];

statementType(tests, "EXPORT", Statements.Export);