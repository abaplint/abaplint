import {CommentedCode} from "../../src/rules/commented_code";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'hello'.", cnt: 0},
  {abap: "* WRITE: / 'hello'.", cnt: 1},
  {abap: "\" WRITE: / 'hello'.", cnt: 1},
  {abap: "* .", cnt: 0},
  {abap: "* ", cnt: 0},
  {abap: "\" ", cnt: 0},
  {abap: "* hello", cnt: 0},
  {abap: "\" hello", cnt: 0},
  {abap: `
* todo
*    DATA(lv_abap) = mo_cut->build_meta( ls_generate ).
*
*    cl_abap_unit_assert=>assert_not_initial( lv_abap ).
*    cl_abap_unit_assert=>assert_char_cp(
*      act = lv_abap
*      exp = '*MOO*' ).`, cnt: 1},
  {abap:
    `" todo
    "    DATA(lv_abap) = mo_cut->build_meta( ls_generate ).
    "
    "    cl_abap_unit_assert=>assert_not_initial( lv_abap ).
       "cl_abap_unit_assert=>assert_char_cp(
       "   act = lv_abap
    "      exp = '*FOO*' ).`, cnt: 1},
  {abap:
    // abapdoc, allowed
      `"! todo
      "!    DATA(lv_abap) = mo_cut->build_meta( ls_generate ).
      "!
      "!    cl_abap_unit_assert=>assert_not_initial( lv_abap ).
         "!cl_abap_unit_assert=>assert_char_cp(
         "!   act = lv_abap
      "!      exp = '*BOO*' ).`, cnt: 0},
  {abap:
    // mix of abapdoc and standard comments
        `" todo
        "    DATA(lv_abap) = mo_cut->build_meta( ls_generate ).
        "
        "    cl_abap_unit_assert=>assert_not_initial( lv_abap ).
           "!cl_abap_unit_assert=>assert_char_cp(
           "!   act = lv_abap
        "!      exp = '*BAR*' ).`, cnt: 1},

  {abap: `REPORT zfoobar.

* DATA foo TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
* DATA foo TYPE STANDARD TABLE OF string WITH DEFAULT KEY.

write bar.

* DATA foo TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
* DATA foo TYPE STANDARD TABLE OF string WITH DEFAULT KEY.

* DATA foo TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
* DATA foo TYPE STANDARD TABLE OF string WITH DEFAULT KEY.

`, cnt: 3},

];

testRule(tests, CommentedCode);