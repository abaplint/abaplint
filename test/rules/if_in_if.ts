import {IfInIf} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "IF foo = bar.\nENDIF.", cnt: 0},
  {abap: "IF foo = bar.\nELSE.\nENDIF.", cnt: 0},
  {abap: "CHECK foo = bar.", cnt: 0},
  {abap: "IF foo = bar.\nIF moo = boo.\nENDIF.\nENDIF.", cnt: 1},
  {abap: "IF foo = bar.\nWRITE bar.\nIF moo = boo.\nENDIF.\nENDIF.", cnt: 0},
  {abap: "IF foo = bar.\nIF moo = boo.\nENDIF.\nWRITE bar.\nENDIF.", cnt: 0},
];

testRule(tests, IfInIf);