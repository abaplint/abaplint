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
  // escaping a keyword is allowed
  {abap: "METHODS foo IMPORTING val TYPE clike !default TYPE i.", cnt: 0},
  {abap: "METHODS foo IMPORTING !optional TYPE i.", cnt: 0},
  {abap: "METHODS foo IMPORTING !preferred TYPE i.", cnt: 0},
  {abap: "METHODS foo IMPORTING !exporting TYPE i.", cnt: 0},
  {abap: "METHODS foo EXPORTING !changing TYPE i.", cnt: 0},
  {abap: "METHODS foo IMPORTING !raising TYPE i.", cnt: 0},
  {abap: "METHODS foo IMPORTING !value(bar) TYPE i.", cnt: 0},
  {abap: "DATA !Data TYPE i.", cnt: 0},
  {abap: "METHODS foo IMPORTING !default TYPE i !bar TYPE i.", cnt: 1},
];

testRule(tests, NoExclamationEscape);

const fixes = [
  {input: "DATA !foo TYPE i.", output: "DATA foo TYPE i."},
  {input: "methods CONVERT changing !CO_sdf type ref to ZCL_sdf optional.", output: "methods CONVERT changing CO_sdf type ref to ZCL_sdf optional."},
];

testRuleFix(fixes, NoExclamationEscape);
