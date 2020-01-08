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
  // statics
  {abap: "STATICS foo TYPE i VALUE 10.", cnt: 1},
  {abap: `STATICS: BEGIN OF stat_foo,
                     foo TYPE i VALUE 10,
                   END OF stat_foo.`, cnt: 1},

  // default key
  {abap: "TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH DEFAULT KEY.", cnt: 1},
  {abap: `TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH DEFAULT KEY. "comment`, cnt: 1},
  {abap: `TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH EMPTY KEY. "DEFAULT KEY`, cnt: 0},
  {abap: "TYPES: ty_table TYPE STANDARD TABLE OF usr02 WITH EMPTY KEY.", cnt: 0},
  {abap: "DATA: lt_foo TYPE STANDARD TABLE OF usr02 WITH DEFAULT KEY.", cnt: 1},
  {abap: "DATA: lt_foo TYPE STANDARD TABLE OF usr02 WITH EMPTY KEY.", cnt: 0},

  // break
  {abap: "break-point.", cnt: 1},
  {abap: "break user.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "break-point id foo.", cnt: 0},
];

testRule(tests, AvoidUse);