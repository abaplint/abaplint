import {UnreachableCode} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "RETURN.\nWRITE 'hello'.", cnt: 1},
  {abap: "IF foo = bar.\nRETURN.\nENDIF.\nWRITE 'hello'.", cnt: 0},
  {abap: "IF foo = bar.\nRETURN. \" comment\nENDIF.\nWRITE 'hello'.", cnt: 0},
  {abap: "SUBMIT zrest WITH s_messag IN sdfsd TO SAP-SPOOL SPOOL PARAMETERS ls_pr WITH" +
    "OUT SPOOL DYNPRO VIA JOB gv_jobname NUMBER lv_jobcnt AND RETURN.\n" + "IF sy-subrc EQ 0.", cnt: 0},
  {abap: "LEAVE TO LIST-PROCESSING AND RETURN TO SCREEN 0.\nWRITE moo.", cnt: 0},
];

testRule(tests, UnreachableCode);