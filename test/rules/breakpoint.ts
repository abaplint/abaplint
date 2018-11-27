import {Breakpoint} from "../../src/rules/breakpoint";
import {testRule} from "./_utils";

const tests = [
  {abap: "break-point.", cnt: 1},
  {abap: "break user.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "break-point id foo.", cnt: 0},
];

testRule(tests, Breakpoint);