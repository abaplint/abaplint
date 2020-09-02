import {testRule} from "./_utils";
import {LineBreakStyle} from "../../src/rules";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "", cnt: 0},
  {abap: "  ", cnt: 0},
  {abap: "method( \r).", cnt: 0}, // caught by 7bit_ascii
  {abap: "method( \r\n).", cnt: 1},
  {abap: "method( \n).", cnt: 0},
];

testRule(tests, LineBreakStyle);