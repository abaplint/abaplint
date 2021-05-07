import {testRule} from "./_utils";
import {UseLineExists} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CREATE OBJECT foobar.", cnt: 0},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 1},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
  IF sy-subrc = 4.
  ENDIF.`, cnt: 1},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
  IF sy-subrc <> 0.
  ENDIF.`, cnt: 1},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
* comment
  IF sy-subrc = 0.
  ENDIF.`, cnt: 1},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
" comment
  IF sy-subrc = 0.
  ENDIF.`, cnt: 1},
  {abap: `
READ TABLE itab TRANSPORTING NO FIELDS INDEX 1.
CHECK sy-subrc = 0.`, cnt: 1},
  {abap: `
READ TABLE rt_list TRANSPORTING NO FIELDS WITH KEY kind = 'E'.
mv_success = boolc( sy-subrc <> 0 ).`, cnt: 1},
  {abap: `
READ TABLE mt_log WITH KEY is_important = abap_true TRANSPORTING NO FIELDS.
rv_boolean = boolc( sy-subrc IS INITIAL ).`, cnt: 1},
  {abap: `
READ TABLE lt_t100u TRANSPORTING NO FIELDS WITH KEY arbgb = lv_msg_id msgnr = <ls_t100_text>-msgnr BINARY SEARCH.
CHECK sy-subrc = 0. "if original message doesn't exist no translations added`, cnt: 0},
  {abap: `
READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
IF ( sy-subrc <> 0 ).
ENDIF.`, cnt: 1},
  {abap: `
READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A'.
IF sy-subrc IS INITIAL.
ENDIF.`, cnt: 1},
  {abap: `
READ TABLE nested_tree TRANSPORTING NO FIELDS
      WITH TABLE KEY
        left = min-left.
CHECK ( sy-subrc = 0 ).
LOOP AT nested_tree ASSIGNING FIELD-SYMBOL(<item>) FROM sy-tabix.
  IF ( <item>-left > max-right ).
    EXIT.
  ENDIF.
  INSERT <item>-left INTO TABLE result.
ENDLOOP.`, cnt: 0},
  {abap: `
  READ TABLE my_table TRANSPORTING NO FIELDS WITH KEY key = 'A' BINARY SEARCH.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 0},
];

testRule(tests, UseLineExists);
