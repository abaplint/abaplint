import {ContainsTab} from "../../src/rules/contains_tab";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "data: lt_file\ttype solix_tab.", cnt: 1},
  {abap: "\t\tIF foo = bar.", cnt: 1},
  {abap: "IF foo = bar.\t", cnt: 1},
  {abap: "IF foo = bar.", cnt: 0},
];

testRule(tests, ContainsTab);

const fixTests = [
  {input: "IF 1 = 1.\t", output: "IF 1 = 1. "},
  {input: "data: lt_file\ttype solix_tab.", output: "data: lt_file type solix_tab."},
  {input: "\t\t\tIF foo = bar.", output: " IF foo = bar."},
  {input: "IF foo\t\t\t = bar.", output: "IF foo  = bar."},
];
testRuleFix(fixTests, ContainsTab);