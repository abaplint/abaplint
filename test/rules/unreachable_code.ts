import {UnreachableCode} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "RETURN.\nWRITE 'hello'.", cnt: 1},
  {abap: "IF foo = bar.\nRETURN.\nENDIF.\nWRITE 'hello'.", cnt: 0},
  {abap: "IF foo = bar.\nRETURN. \" comment\nENDIF.\nWRITE 'hello'.", cnt: 0},
];

testRule(tests, UnreachableCode);