import {testRule, testRuleFix} from "./_utils";
import {PreferAbapBoolValues} from "../../src/rules";

const tests = [
  // negative: non-bool types not flagged
  {abap: `DATA lv_char TYPE c LENGTH 1.\nlv_char = 'X'.`, cnt: 0},
  {abap: `DATA lv_str TYPE string.\nlv_str = 'X'.`, cnt: 0},
  // negative: already using abap_true/abap_false
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = abap_true.`, cnt: 0},
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = abap_false.`, cnt: 0},
  // negative: abap_undefined is also valid
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = abap_undefined.`, cnt: 0},
  // positive: assignment with 'X'
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = 'X'.`, cnt: 1},
  // positive: assignment with ' '
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = ' '.`, cnt: 1},
  // positive: comparison in IF
  {abap: `DATA lv_flag TYPE abap_bool.\nIF lv_flag = 'X'.\nENDIF.`, cnt: 1},
  {abap: `DATA lv_flag TYPE abap_bool.\nIF lv_flag = ' '.\nENDIF.`, cnt: 1},
  // positive: comparison reversed operand order
  {abap: `DATA lv_flag TYPE abap_bool.\nIF 'X' = lv_flag.\nENDIF.`, cnt: 1},
  // negative: comparison of non-bool
  {abap: `DATA lv_char TYPE c.\nIF lv_char = 'X'.\nENDIF.`, cnt: 0},
  // positive: COND expression THEN/ELSE with literals
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = COND #( WHEN 1 = 1 THEN 'X' ELSE ' ' ).`, cnt: 2},
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = COND #( WHEN 1 = 1 THEN 'X' ).`, cnt: 1},
  // positive: SWITCH expression THEN/ELSE with literals
  {abap: `DATA lv_flag TYPE abap_bool.\nDATA lv_x TYPE i.\nlv_flag = SWITCH #( lv_x WHEN 1 THEN 'X' ELSE ' ' ).`, cnt: 2},
  // negative: COND assigned to non-bool target
  {abap: `DATA lv_char TYPE c.\nlv_char = COND #( WHEN 1 = 1 THEN 'X' ELSE ' ' ).`, cnt: 0},
  // positive: CLASS-DATA
  // eslint-disable-next-line max-len
  {abap: `CLASS lcl DEFINITION.\n  PUBLIC SECTION.\n    CLASS-DATA gv_flag TYPE abap_bool.\nENDCLASS.\nCLASS lcl IMPLEMENTATION.\n  METHOD foo.\n    gv_flag = 'X'.\n  ENDMETHOD.\nENDCLASS.`, cnt: 1},
  // positive: multiple issues in one file
  {abap: `DATA lv_flag TYPE abap_bool.\nlv_flag = 'X'.\nlv_flag = ' '.`, cnt: 2},
];

testRule(tests, PreferAbapBoolValues);

const fixTests = [
  {
    input:  `DATA lv_flag TYPE abap_bool.\nlv_flag = 'X'.`,
    output: `DATA lv_flag TYPE abap_bool.\nlv_flag = abap_true.`,
  },
  {
    input:  `DATA lv_flag TYPE abap_bool.\nlv_flag = ' '.`,
    output: `DATA lv_flag TYPE abap_bool.\nlv_flag = abap_false.`,
  },
  {
    input:  `DATA lv_flag TYPE abap_bool.\nIF lv_flag = 'X'.\nENDIF.`,
    output: `DATA lv_flag TYPE abap_bool.\nIF lv_flag = abap_true.\nENDIF.`,
  },
  {
    input:  `DATA lv_flag TYPE abap_bool.\nIF lv_flag = ' '.\nENDIF.`,
    output: `DATA lv_flag TYPE abap_bool.\nIF lv_flag = abap_false.\nENDIF.`,
  },
];

testRuleFix(fixTests, PreferAbapBoolValues);
