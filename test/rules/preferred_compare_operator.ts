import {PreferredCompareOperator} from "../../src/rules/preferred_compare_operator";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "IF foo = bar. ENDIF.", cnt: 0},
  {abap: "IF foo EQ bar. ENDIF.", cnt: 1},
  {abap: "IF foo >< bar. ENDIF.", cnt: 1},
];

testRule(tests, PreferredCompareOperator);