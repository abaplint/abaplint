import {testRule} from "../_utils";
import {DoubleSpace} from "../../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "IF  foo = bar.", cnt: 1},
  {abap: "IF foo = bar.", cnt: 0},
];

testRule(tests, DoubleSpace);