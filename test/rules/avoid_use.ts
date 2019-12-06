import {AvoidUse} from "../../src/rules/avoid_use";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "DEFINE _bar.", cnt: 1},
  {abap: "ENDSELECT.", cnt: 1},
  {abap: "EXEC SQL.", cnt: 1},
  {abap: "CALL 'SYST_LOGOFF'.", cnt: 1},
  {abap: "ENDSELECT.\nWRITE foobar.", cnt: 1},
  {abap: "parser error", cnt: 0},
  {abap: "SYSTEM-CALL foo.", cnt: 1},
];

testRule(tests, AvoidUse);