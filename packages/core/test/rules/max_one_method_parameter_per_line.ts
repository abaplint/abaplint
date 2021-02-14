import {MaxOneMethodParameterPerLine} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: `WRITE hello.`, cnt: 0},
  {abap: `WRITE hello.`, cnt: 0},
  {abap: `
INTERFACE lif.
METHODS apps_scope_token
  IMPORTING
    body TYPE bodyapps_scope_token client_id TYPE str.
ENDINTERFACE.`, cnt: 1},
  {abap: `
INTERFACE lif.
METHODS apps_scope_token
  IMPORTING
    body TYPE bodyapps_scope_token
    client_id TYPE str.
ENDINTERFACE.`, cnt: 0},
];

testRule(tests, MaxOneMethodParameterPerLine);