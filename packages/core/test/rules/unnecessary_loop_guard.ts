import {UnnecessaryLoopGuard} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "parser error", cnt: 0},
  // basic not-initial guard — should report
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`, cnt: 1},
  // basic is-initial guard (empty table branch) — should report
  {abap: `IF lt_data IS INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`, cnt: 1},
  // table names differ — no issue
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_other INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`, cnt: 0},
  // has ELSE branch — no issue
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ELSE.
  WRITE 'empty'.
ENDIF.`, cnt: 0},
  // has ELSEIF — no issue
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ELSEIF 1 = 2.
ENDIF.`, cnt: 0},
  // body has extra statement alongside loop — no issue
  {abap: `IF lt_data IS NOT INITIAL.
  WRITE 'before'.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ENDIF.`, cnt: 0},
  // condition is not IS INITIAL — no issue
  {abap: `IF lt_data IS BOUND.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ENDIF.`, cnt: 0},
  // condition uses AND — no issue
  {abap: `IF lt_data IS NOT INITIAL AND lv_flag = abap_true.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ENDIF.`, cnt: 0},
  // simple loop without guard — no issue
  {abap: `LOOP AT lt_data INTO DATA(ls_item).
  WRITE ls_item-name.
ENDLOOP.`, cnt: 0},
];

testRule(tests, UnnecessaryLoopGuard);
