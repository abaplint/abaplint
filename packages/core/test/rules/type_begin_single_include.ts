import {TypeBeginSingleType} from "../../src/rules/";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: `
  TYPES: BEGIN OF foo.
           moo TYPE c LENGTH 1,
         END OF foo.`, cnt: 0},
  {abap: `
  TYPES: BEGIN OF dummy1.
    INCLUDE TYPE dselc.
  TYPES: END OF dummy1.`, cnt: 1},
];

testRule(tests, TypeBeginSingleType);