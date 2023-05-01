import {OmitPrecedingZeros} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: `    generate_extend( iv_token    = '.'
  iv_offset   = 00
  iv_text_tag = '' ).`, cnt: 1},
  {abap: `    generate_extend( iv_token    = '.'
  iv_offset   = 0
  iv_text_tag = '' ).`, cnt: 0},
  {abap: "int = -001.", cnt: 1},
  {abap: "int = -1.", cnt: 0},
  {abap: "int = 123.", cnt: 0},
  {abap: "RAISE EXCEPTION TYPE ycx_see MESSAGE ID 'YSEE' NUMBER 003.", cnt: 0},
  {abap: "MESSAGE e001(abc) WITH lv_par1.", cnt: 0},
  {abap: "call screen 0501 starting at 1 1.", cnt: 0},
  {abap: "SET SCREEN 0100.", cnt: 0},
  {abap: "MESSAGE ID sy-msgid TYPE sy-msgty NUMBER 001.", cnt: 0},
  {abap: `call function 'MOO'
exceptions
  others = 01.`, cnt: 1},
  {abap: `call function 'MOO'
exceptions
  others = 1.`, cnt: 0},
];

testRule(tests, OmitPrecedingZeros);

const fixTests = [
  {
    input: `call function 'MOO'
exceptions
  others = 01.`,
    output: `call function 'MOO'
exceptions
  others = 1.`,
  },
];

testRuleFix(fixTests, OmitPrecedingZeros);