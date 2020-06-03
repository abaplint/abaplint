import {ContainsTab} from "../../../src/rules/contains_tab";
import {testRule} from "../_utils";

const tests = [
  {abap: "data: lt_file\ttype solix_tab.", cnt: 1},
  {abap: "\t\tIF foo = bar.", cnt: 1},
  {abap: "IF foo = bar.\t", cnt: 1},
  {abap: "IF foo = bar.", cnt: 0},
];

testRule(tests, ContainsTab);