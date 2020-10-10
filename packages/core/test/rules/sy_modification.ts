import {SyModification} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "sy-uname = 2.", cnt: 1},
  {abap: "sy = sy.", cnt: 1},
];

testRule(tests, SyModification);