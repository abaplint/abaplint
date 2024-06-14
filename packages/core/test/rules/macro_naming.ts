import {MacroNaming} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "DEFINE foo. END-OF-DEFINITION.", cnt: 1},
  {abap: "DEFINE _foo. END-OF-DEFINITION.", cnt: 0},
];

testRule(tests, MacroNaming);