import {testRule, testRuleFix} from "./_utils";
import {AvoidDescribeLines} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0, fix: false},
  {abap: "CREATE OBJECT foobar.", cnt: 0, fix: false},

  {abap: "DESCRIBE TABLE foo LINES bar.", cnt: 1, fix: true},
  {abap: "DESCRIBE TABLE foo-bar LINES bar.", cnt: 1, fix: true},
  {abap: "describe table foo-bar lines bar.", cnt: 1, fix: true},
  {abap: "bar = lines( foo ).", cnt: 0, fix: false},
];

testRule(tests, AvoidDescribeLines);

const fixes = [
  {input: "DESCRIBE TABLE foo LINES bar.", output: "bar = lines( foo )."},
  {input: "DESCRIBE TABLE foo-bar LINES bar.", output: "bar = lines( foo-bar )."},
  {input: "describe table foo-bar lines bar.", output: "bar = lines( foo-bar )."}
];

testRuleFix(fixes, AvoidDescribeLines);
