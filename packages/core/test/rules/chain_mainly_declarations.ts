import {ChainMainlyDeclarations} from "../../src/rules/";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: `WRITE hello.`, cnt: 0},
  {abap: `BREAK-POINT.`, cnt: 0},
  {abap: `WRITE: hello.`, cnt: 0},
  {abap: `CALL METHOD: hello.`, cnt: 1},
  {abap: `SPLIT ls_source-objnm AT ' ' INTO: DATA(lv_source) DATA(lv_rest).`, cnt: 1},
  {abap: `SORT: foo, bar.`, cnt: 1},
];

testRule(tests, ChainMainlyDeclarations);