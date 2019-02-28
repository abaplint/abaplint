import {testRule} from "./_utils";
import {EmptyLineinStatement} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "EXIT.", cnt: 0},
  {abap: "SELECT kunnr INTO lv_kunnr FROM kna1.\nCHECK sy-dbcnt > is_paging-skip.\nENDSELECT.", cnt: 0},
  {abap: "WRITE: foo,\nbar.", cnt: 0},
  {abap: "WRITE\n\nbar.", cnt: 1},
  {abap: "* comment\n\nWRITE bar.", cnt: 0},
];

testRule(tests, EmptyLineinStatement);