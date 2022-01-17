import {OmitPrecedingZeros} from "../../src/rules";
import {testRule} from "./_utils";

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
];

testRule(tests, OmitPrecedingZeros);