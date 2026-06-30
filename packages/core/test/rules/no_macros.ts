import {NoMacros} from "../../src/rules/no_macros";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "DEFINE _macro.\nWRITE 'hello'.\nEND-OF-DEFINITION.", cnt: 1},
  {abap: "DEFINE _macro.\nWRITE 'hello'.\nEND-OF-DEFINITION.\n_macro.", cnt: 1},
  {abap: "parser error", cnt: 0},
];

testRule(tests, NoMacros);
