import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SUBMIT zdemo WITH rb_down = abap_true WITH rb_show = abap_false AND RETURN.",
  "SUBMIT (wa_report-progname) VIA SELECTION-SCREEN AND RETURN.",
  "submit zreport and return with bar in foo with dark = 'X'.",
  "SUBMIT zmoo WITH p_foo EQ bar WITH p_bar EQ foo.",
  "SUBMIT zfoobar WITH s_print = iv_tddest WITH s_pnow = 'X' VIA JOB 'BKG' NUMBER lv_number AND RETURN.",
  "SUBMIT (progname) AND RETURN WITH p_backfn = filename WITH rb_back  = 'X'.",
  "SUBMIT zfoo VIA SELECTION-SCREEN WITH SELECTION-TABLE tab AND RETURN.",
  "submit zfoo exporting list to memory and return.",
  "submit zfoo via job jname number jnumber to sap-spool spool parameters params \n" +
    "archive parameters aparams without spool dynpro and return.",
  "SUBMIT (name) LINE-SIZE width LINE-COUNT length AND RETURN.",
  "submit zfoo with moo = stru-sdf with bar = stru-sdff via selection-screen and return.",
  "SUBMIT zfoo AND RETURN USER SY-UNAME VIA JOB name NUMBER count.",
  "submit zfoo with field eq lv_value sign lv_sign and return.",
  "SUBMIT zfoo VIA SELECTION-SCREEN AND RETURN WITH p_add INCL boo WITH p_sub INCL moo.",
  "submit (lv_report) with kunnr = lv_kunnr with bukrs = lv_bukrs using selection-set lv_set with free selections lt_free and return.",
  "submit (lv_report) via selection-screen and return using selection-sets of program l_prog with free selections l_expressions.",
  "SUBMIT zfoo WITH SELECTION-TABLE lt_para WITH type BETWEEN 'A' AND 'B' WITH call = 'X' AND RETURN.",
  "SUBMIT zfoo TO SAP-SPOOL WITHOUT SPOOL DYNPRO KEEP IN SPOOL 'X' IMMEDIATELY 'X' DESTINATION 'LP01' AND RETURN.",
  "SUBMIT /foo/bar USING SELECTION-SCREEN '1000' VIA SELECTION-SCREEN WITH foo EQ 'X'.",
  "SUBMIT zsdfsdf WITH num EQ lv_num WITH date GE '00000000'.",
  "SUBMIT zfoobar WITH field BETWEEN foo AND bar SIGN 'I' AND RETURN.",

  /* todo, how to handle this
  "SUBMIT zblah\n" +
  "  WITH p_bukrs = p_bukrs\n" +
  "  WITH SELECTION-TABLE lt_belnr\n" +
  "  WITH p_list = p_list.",
*/

  "SUBMIT zfoo AND RETURN\n" +
  "  WITH s_type = lv_type\n" +
  "  WITH s_name CP name.",

  "submit zfoobar\n" +
  "  with field1 EQ lv_field1\n" +
  "  with field2 EQ lv_field2\n" +
  "  via job lv_jobname number lv_jobcount\n" +
  "  to sap-spool destination lv_device\n" +
  "               immediately ' '\n" +
  "               new list identification 'X'\n" +
  "               layout 'X_65_80'\n" +
  "               sap cover page 'N'\n" +
  "               without spool dynpro\n" +
  "  and return.",

  "SUBMIT (name) WITH SELECTION-TABLE tab VIA SELECTION-SCREEN WITH mode = '1'.",

  "SUBMIT zprog WITH p_foo EQ lv_foo SIGN 'I' WITH p_bar EQ lv_bar SIGN 'I' AND RETURN.",
  "SUBMIT zfoobar VIA JOB lv_job NUMBER lv_number USER lv_user LANGUAGE lv_language AND RETURN.",
  "SUBMIT zfoobar WITH rang-low EQ low AND RETURN.",

  /* todo
  `SUBMIT zsdfsd
  WITH foo = bar
  WITH layout = layout EXPORTING LIST TO MEMORY
  WITH bar IN moo
  AND RETURN.`,
  */
];

statementType(tests, "SUBMIT", Statements.Submit);