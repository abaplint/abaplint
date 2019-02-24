import {LineOnlyPunc} from "../../src/rules/line_only_punc";
import {testRule} from "./_utils";

const tests = [
  {abap: "zcl_class=>method(\n).", cnt: 1},
  {abap: "WRITE 'hello'\n.", cnt: 1},
  {abap: "CALL METHOD SUPER->CONSTRUCTOR\nEXPORTING\nPREVIOUS = PREVIOUS\n.", cnt: 1},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "WRITE 'bar'\n. \" comment", cnt: 1},
];

testRule(tests, LineOnlyPunc);