import {WhitespaceEnd} from "../../src/rules/whitespace_end";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "WRITE 'hello'.  ", cnt: 1},
];

testRule(tests, WhitespaceEnd);