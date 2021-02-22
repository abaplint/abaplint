import {DangerousStatement} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "EXEC SQL.", cnt: 1},
  {abap: "CALL 'SYST_LOGOFF'.", cnt: 1},
  {abap: "parser error", cnt: 0},
  {abap: "SYSTEM-CALL foo.", cnt: 1},
  {abap: "INSERT REPORT lv_prog FROM lt_tab VERSION 'X'.", cnt: 1},
];

testRule(tests, DangerousStatement);
