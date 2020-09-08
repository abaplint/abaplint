import {BeginSingleInclude} from "../../src/rules";
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
  {abap: `
  DATA BEGIN OF foo.
    INCLUDE STRUCTURE syst.
  DATA END OF foo.`, cnt: 1},
  {abap: `
  STATICS BEGIN OF bar.
    INCLUDE STRUCTURE syst.
  STATICS END OF bar.`, cnt: 1},

];

testRule(tests, BeginSingleInclude);