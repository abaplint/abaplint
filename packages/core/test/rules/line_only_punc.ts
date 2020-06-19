import {LineOnlyPunc} from "../../src/rules/line_only_punc";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "zcl_class=>method(\n).", cnt: 1},
  {abap: "WRITE 'hello'\n.", cnt: 1},
  {abap: "CALL METHOD SUPER->CONSTRUCTOR\nEXPORTING\nPREVIOUS = PREVIOUS\n.", cnt: 1},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "WRITE 'bar'\n. \" comment", cnt: 1},
  {abap: "*", cnt: 0},
  {abap: "*  ", cnt: 0},
  {abap: "* comment", cnt: 0},
  {abap: "\" comment", cnt: 0},
];

testRule(tests, LineOnlyPunc);

const fixTests = [
  {input: "WRITE 'hello'\n.", output: "WRITE 'hello'."},
  {input: "WRITE 'hello'\n\t   .   ", output: "WRITE 'hello'."},
  {input: "IF line_exists( foo[1] \n ).", output: "IF line_exists( foo[1] )."},
  {input: "IF line_exists( foo[1]\n).", output: "IF line_exists( foo[1] )."},
];

testRuleFix(fixTests, LineOnlyPunc);