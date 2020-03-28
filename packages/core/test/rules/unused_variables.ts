import {testRule} from "./_utils";
import {UnusedVariables} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "WRITE bar.", cnt: 0},
  {abap: "DATA foo.", cnt: 1},
  {abap: "DATA foo.\nWRITE foo.", cnt: 0},
];

testRule(tests, UnusedVariables);