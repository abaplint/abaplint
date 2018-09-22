import {ContainsTab} from "../../src/rules/contains_tab";
import {testRule} from "./utils";

let tests = [
  {abap: "data: lt_file\ttype solix_tab.", cnt: 1},
  {abap: "\t\tIF foo = bar.", cnt: 1},
  {abap: "IF foo = bar.", cnt: 0},
];

testRule(tests, "test contains_tab rule", ContainsTab);