import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "IF foo = bar.",
  "IF foo = bar AND moo = boo.",
  "IF lv_column_s CN sy-abcde.",
  "IF ep_style IS REQUESTED.",
  "IF foo NE 0.",
  "IF go_gui IS NOT BOUND.",
  "IF lv_left >= strlen( mv_bits ).",
  "if foobar na 'C'.",
  "IF foo => 0.",
  "IF li_node IS BOUND.",
  "IF sy-tabix BETWEEN from AND to.",
  "IF iv_str CA '/'.",
  "IF iv_param CS iv_type.",
  "IF NOT it_tpool IS INITIAL.",
  "IF NOT it_tpool[] IS INITIAL.",
  "IF ( sy-subrc = 0 AND lines( it_tpool ) = 1 ) OR lines( it_tpool ) = 0.",
  "IF xstrlen( ls_file-file-data ) = 2.",
  "IF lines( lt_lines ) MOD 2 <> 0.",
//  "IF NOT &1 IS INITIAL.",
  "IF foo = bar AND NOT ( foo = bar OR moo = boo ).",
  "IF lv_devclass NOT IN mt_devclass.",
  "IF lv_statement IN mt_range.",
  "IF iv_branch_name IS SUPPLIED.",
  "IF out EQ abap_false.",
  "IF is_foo O lv_bar.",
  "IF lv_filename NS '.xls'.",
  "IF ( lv_offset + 1 ) MOD 8 = 0.",
  "IF is_item-obj_name IS INITIAL.",
  "IF iv_f < - lv_maxint OR iv_f > lv_maxint.",
  "IF foo = bar OR moo = boo.",
  "IF <field> NOT BETWEEN ls_foo-low AND ls_foo-high.",
  "IF ( foo = bar ).",
  "IF lcl_foo=>check( ).",
  "IF bar =< foo.",
  "if child is INSTANCE OF cl_gui_container.",
  "if not line_exists( added[ function = iv_function ] ).",
  "if foo = bar and line_exists( fcat[ fieldname = 'MOO' ] ).",
  "IF foo(2) = 12 OR foo(2) = 12.",
  "IF foo BYTE-CO bar.",
  "IF data BYTE-NS end.",

  "IF ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ) OR \n" +
  "  ( foo-bar CP 'a' ).",

  "IF foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12\n" +
  "  OR foo(2) = 12.",

  "IF NOT line_exists( lt_eord[ KEY primary_key COMPONENTS matnr = <ls_excel>-matnr \n" +
    "werks = <ls_excel>-werks lifnr = <ls_excel>-lifnr ] ).",
  "IF alv? = ''.",
  "IF gi_tab-field* = 'X'.",
  "if not line_exists( outputs[ table_line->alv = io_alv ] ).",
  "if lv_value <> - 1.",
  "IF a = b EQUIV c = d.",
  "IF foo- = 2.", // "foo-" is an allowed variable name
  "IF ( foo = 'bar').",
  "IF ('bar' = foo ).",
  "IF |{ lv_host CASE = (cl_abap_format=>c_lower) }| EQ 'http'.",
];

statementType(tests, "IF", Statements.If);