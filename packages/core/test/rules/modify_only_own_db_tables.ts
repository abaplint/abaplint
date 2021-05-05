import {ModifyOnlyOwnDBTables} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "CALL TRANSACTION 'ZFOO' WITH AUTHORITY-CHECK.", cnt: 0},
  {abap: "sdfds", cnt: 0},
  {abap: "DELETE FROM zbar WHERE moo = @bar.", cnt: 0},
  {abap: "DELETE FROM bar WHERE moo = @bar.", cnt: 1},
  {abap: "MODIFY SCREEN FROM line.", cnt: 0},
];

testRule(tests, ModifyOnlyOwnDBTables);