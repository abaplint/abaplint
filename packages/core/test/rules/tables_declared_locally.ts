import {TablesDeclaredLocally} from "../../src/rules/tables_declared_locally";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "TABLES sdfds.", cnt: 0},
  {abap: `FORM foo.
  TABLES t100.
ENDFORM.`, cnt: 1},
];

testRule(tests, TablesDeclaredLocally);