import {UnnecessaryChaining} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `WRITE: bar.`, cnt: 1},
  {abap: `WRITE bar.`, cnt: 0},
  {abap: `WRITE: bar, moo.`, cnt: 0},
];

testRule(tests, UnnecessaryChaining);