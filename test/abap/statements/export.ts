import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "EXPORT foo TO MEMORY ID 'MOO'.",
  "EXPORT list = it_list TO DATA BUFFER lv_xstring COMPRESSION ON.",
  "EXPORT mv_errty = mv_errty TO DATA BUFFER p_attributes.",
  "EXPORT (lt_export) TO DATA BUFFER lv_attributes.",
  "EXPORT lt_table1 lt_table2 TO MEMORY ID L_MEMID.",
  "export lt_dump to database LTCX(LT) id ls_key.",
  "EXPORT p1 = is_option TO DATABASE indx(xl) FROM ws_indx ID ws_indx-srtfd.",
  "EXPORT tab = tab TO DATABASE foo(tx) ID bar FROM moo.",
  "EXPORT foo = lt_foo TO DATABASE indx(rt) FROM indx_wa CLIENT sy-mandt ID lv_id.",
  "EXPORT foo = <bar> TO INTERNAL TABLE tab.",
  "EXPORT tab = lt_tab TO SHARED MEMORY bar(aa) ID lv_id.",
  "EXPORT size = l_size TO DATA BUFFER ls_foo-data COMPRESSION OFF.",
  "EXPORT data_tab FROM it_data TO DATABASE foobar(fo) FROM gs_field ID key USING var.",
  "EXPORT lv_flag FROM lv_flag TO SHARED BUFFER indx(ar) ID 'BLAH'.",
  "EXPORT itab = l_log_itab TO DATABASE foobar(aa) ID l_key FROM l_wa code page hint l_settings-field.",
  "EXPORT tclass = lv_foo lv_bar TO MEMORY ID 'ID'.",
  "EXPORT foo-bar moo-boo TO MEMORY ID 'ABCD'.",
//  "EXPORT <wa> = <wa> TO DATABASE foobar(aa) ID me->name FROM l_wa.",
];

statementType(tests, "EXPORT", Statements.Export);