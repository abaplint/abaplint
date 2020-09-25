import {testRule, testRuleFix} from "./_utils";
import {PreferXsdbool} from "../../src/rules";

const tests = [
  {abap: "sdfsd sdfsd sdf", cnt: 0},
  {abap: "DATA(sdf) = boolc( 1 = 2 ).", cnt: 1},
  {abap: "DATA(sdf) = xsdbool( 1 = 2 ).", cnt: 0},
];

testRule(tests, PreferXsdbool);

const fixTests = [
  {input: "DATA(sdf) = boolc( 1 = 2 ).", output: "DATA(sdf) = xsdbool( 1 = 2 )."},
];

testRuleFix(fixTests, PreferXsdbool);