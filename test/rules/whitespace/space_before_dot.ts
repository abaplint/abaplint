import {testRule} from "../_utils";
import {SpaceBeforeDot} from "../../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: ".", cnt: 0},
  {abap: "* comment", cnt: 0},
  {abap: "\" sdfsd", cnt: 0},
  {abap: "WRITE 'abc'.", cnt: 0},
  {abap: "WRITE 'abc' .", cnt: 1},
];

testRule(tests, SpaceBeforeDot);