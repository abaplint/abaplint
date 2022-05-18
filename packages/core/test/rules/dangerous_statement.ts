import {DangerousStatement} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "EXEC SQL.", cnt: 1},
  {abap: "CALL 'SYST_LOGOFF'.", cnt: 1},
  {abap: "parser error", cnt: 0},
  {abap: "SYSTEM-CALL foo.", cnt: 1},
  {abap: "INSERT REPORT lv_prog FROM lt_tab VERSION 'X'.", cnt: 1},

  {abap: "UPDATE /dmo/flight SET (dynamicUpdate) WHERE carrier_id = @carrierId AND connection_id = @connectionId.", cnt: 1},
  {abap: "UPDATE /dmo/flight SET foo = 2 WHERE carrier_id = @carrierId AND connection_id = @connectionId.", cnt: 0},
  {abap: "SELECT * FROM /dmo/flight WHERE (sql) INTO table @DATA(results).", cnt: 1},
  {abap: "SELECT * FROM /dmo/flight WHERE foo = bar INTO table @DATA(results).", cnt: 0},
  {abap: "SELECT * FROM (dbTable) INTO TABLE @<results> UP TO 100 ROWS.", cnt: 1},
  {abap: "SELECT * FROM tab INTO TABLE @<results> UP TO 100 ROWS.", cnt: 0},
// this is hardcoded dynamic, so no SQL injection possible, at all,
  {abap: "SELECT * FROM ssyntaxstructure INTO TABLE @DATA(gt_syntax) WHERE (`proglang IS NULL`).", cnt: 0},
];

testRule(tests, DangerousStatement);
