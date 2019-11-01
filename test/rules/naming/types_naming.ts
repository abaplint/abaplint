import {TypesNaming} from "../../../src/rules/naming/types_naming";
import {testRule} from "../_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "TYPES foo.", cnt: 1},
  {abap: "TYPES tyfoo.", cnt: 1},
  {abap: "TYPES ty_foo.", cnt: 0},
  {abap: "TYPES BEGIN OF bar.\nTYPES moo.\nTYPES END OF bar.", cnt: 1},
  {abap: "TYPES BEGIN OF ty_bar.\nTYPES moo.\nTYPES END OF ty_bar.", cnt: 0},
];

testRule(tests, TypesNaming);