import {EmptyStatement} from "../../src/rules/empty_statement";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "types foo type c.  .", cnt: 1},
  {abap: "types foo type c..", cnt: 1},
  {abap: ".types foo type c.", cnt: 1},
  {abap: "types foo type c.\n.", cnt: 1},
  {abap: "types foo type c.\n.\n", cnt: 1},
  {abap: "types foo type c..\n", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, EmptyStatement);

const fixes = [
  {input: "types f1 type c.  .", output: "types f1 type c."},
  {input: "types f2 type c.\n  .", output: "types f2 type c."},
  {input: "types f3 type c..", output: "types f3 type c."},
  {input: "  .", output: ""},
];

testRuleFix(fixes, EmptyStatement);