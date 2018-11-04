import {LineOnlyPunc} from "../../src/rules/line_only_punc";
import {testRule} from "./_utils";

let tests = [
  {abap: "zcl_class=>method(\n).", cnt: 1},
  {abap: "WRITE 'hello'\n.", cnt: 1},
  {abap: "CALL METHOD SUPER->CONSTRUCTOR\nEXPORTING\nPREVIOUS = PREVIOUS\n.", cnt: 1},
  {abap: "WRITE 'hello'.", cnt: 0},
];

testRule(tests, "test line_only_punc rule", LineOnlyPunc);