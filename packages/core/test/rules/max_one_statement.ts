import {MaxOneStatement} from "../../src/rules/max_one_statement";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "WRITE 'hello'.  WRITE 'world'.  WRITE 'world'.", cnt: 1},
  {abap: "WRITE 'hello'.WRITE 'world'.", cnt: 1},
  {abap: "DATA: foo TYPE x, bar TYPE x.", cnt: 0},
  {abap: "DATA: foo TYPE x,\nbar TYPE x.", cnt: 0},
  {abap: "WRITE 'hello'. .", cnt: 0}, // do not report empty statement, it is handled by separate rule
  {abap: "WRITE 'hello'.\nWRITE 'world'.\nWRITE 'world'.", cnt: 0},
  {abap: `
DEFINE _foo.
  WRITE 'a'.
END-OF-DEFINITION.
_foo.
  `, cnt: 0},
];

testRule(tests, MaxOneStatement);

const fixes = [
  {input: "WRITE 'hello'.WRITE 'world'.", output: "WRITE 'hello'.\nWRITE 'world'."},
];

testRuleFix(fixes, MaxOneStatement);