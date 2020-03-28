import {testRule} from "./_utils";
import {UseNew} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CREATE OBJECT foobar.", cnt: 1},
  {abap: "foobar = NEW #( ).", cnt: 0},
  {abap: "CREATE OBJECT ref TYPE ('ZCL_CLASS').", cnt: 0},
];

testRule(tests, UseNew);