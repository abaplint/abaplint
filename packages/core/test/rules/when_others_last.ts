import {testRule} from "./_utils";
import {WhenOthersLast} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "CASE foo. ENDCASE.", cnt: 0},
  {abap: "CASE foo. WHEN OTHERS. ENDCASE.", cnt: 0},
  {abap: "CASE foo. WHEN 2. WHEN OTHERS. ENDCASE.", cnt: 0},
  {abap: "CASE foo. WHEN OTHERS. WHEN 2. ENDCASE.", cnt: 1},
];

testRule(tests, WhenOthersLast);