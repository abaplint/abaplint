import {NoExternalFormCalls} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "DELETE foo FROM bar.", cnt: 0},
  {abap: "PERFORM foo.", cnt: 0},
  {abap: "PERFORM foo IN PROGRAM bar.", cnt: 1},
  {abap: "PERFORM foo(bar).", cnt: 1},
];

testRule(tests, NoExternalFormCalls);