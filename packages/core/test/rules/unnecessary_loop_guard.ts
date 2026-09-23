import {UnnecessaryLoopGuard} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "parser error", cnt: 0},
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`, cnt: 1},
  {abap: `IF lt_data IS INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`, cnt: 1},
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_other INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`, cnt: 0},
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ELSE.
  WRITE 'empty'.
ENDIF.`, cnt: 0},
  {abap: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ELSEIF 1 = 2.
ENDIF.`, cnt: 0},
  {abap: `IF lt_data IS NOT INITIAL.
  WRITE 'before'.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ENDIF.`, cnt: 0},
  {abap: `IF lt_data IS BOUND.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ENDIF.`, cnt: 0},
  {abap: `IF lt_data IS NOT INITIAL AND lv_flag = abap_true.
  LOOP AT lt_data INTO DATA(ls_item).
  ENDLOOP.
ENDIF.`, cnt: 0},
  {abap: `LOOP AT lt_data INTO DATA(ls_item).
  WRITE ls_item-name.
ENDLOOP.`, cnt: 0},
];

const fixes = [
  {
    input: `IF lt_data IS NOT INITIAL.
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
ENDIF.`,
    output: `
  LOOP AT lt_data INTO DATA(ls_item).
    WRITE ls_item-name.
  ENDLOOP.
`,
  },
];

testRule(tests, UnnecessaryLoopGuard);
testRuleFix(fixes, UnnecessaryLoopGuard);
