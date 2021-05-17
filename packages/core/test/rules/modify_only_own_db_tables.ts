import {ModifyOnlyOwnDBTables, ModifyOnlyOwnDBTablesConf} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.", cnt: 0},
  {abap: "sdfds", cnt: 0},
  {abap: "DELETE FROM zbar WHERE moo = @bar.", cnt: 0},
  {abap: "DELETE FROM bar WHERE moo = @bar.", cnt: 1},
  {abap: "MODIFY SCREEN FROM line.", cnt: 0},
  {abap: "INSERT (lv_tab) FROM @lv_data.", cnt: 1},
];

testRule(tests, ModifyOnlyOwnDBTables);

const dontReportDynamic = new ModifyOnlyOwnDBTablesConf();
dontReportDynamic.reportDynamic = false;

const tests2 = [
  {abap: "DELETE FROM bar WHERE moo = @bar.", cnt: 1},
  {abap: "INSERT (lv_tab) FROM @lv_data.", cnt: 0},
];

testRule(tests2, ModifyOnlyOwnDBTables, dontReportDynamic);