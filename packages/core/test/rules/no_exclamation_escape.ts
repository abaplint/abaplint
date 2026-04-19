import {NoExclamationEscape} from "../../src/rules/no_exclamation_escape";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "methods CONVERT changing !CO_sdf type ref to ZCL_sdf optional.", cnt: 1},
  {abap: "DATA !foo TYPE i.", cnt: 1},
  {abap: "DATA foo TYPE i.", cnt: 0},
  {abap: "WRITE '!hello'.", cnt: 0}, // in a string
  {abap: "DATA \\!foo TYPE i.", cnt: 0}, // not a standard exclamation
];

testRule(tests, NoExclamationEscape);

const fixes = [
  {input: "DATA !foo TYPE i.", output: "DATA foo TYPE i."},
  {input: "methods CONVERT changing !CO_sdf type ref to ZCL_sdf optional.", output: "methods CONVERT changing CO_sdf type ref to ZCL_sdf optional."},
];

testRuleFix(fixes, NoExclamationEscape);
