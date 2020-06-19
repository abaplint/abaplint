import {PreferredCompareOperator, PreferredCompareOperatorConf} from "../../src/rules/preferred_compare_operator";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "IF foo = bar. ENDIF.", cnt: 0},
  {abap: "IF foo EQ bar. ENDIF.", cnt: 1},
  {abap: "IF foo >< bar. ENDIF.", cnt: 1},
  {abap: "SELECT * FROM foo INTO TABLE bar WHERE moo EQ boo.", cnt: 1},
];

testRule(tests, PreferredCompareOperator);

const fixTests = [
  {input: "IF foo EQ bar. ENDIF.", output: "IF foo = bar. ENDIF."},
  {input: "IF foo NE bar. ENDIF.", output: "IF foo <> bar. ENDIF."},
  {input: "IF foo >< bar. ENDIF.", output: "IF foo <> bar. ENDIF."},
  {input: "IF foo GT bar. ENDIF.", output: "IF foo > bar. ENDIF."},
  {input: "IF foo GE bar. ENDIF.", output: "IF foo >= bar. ENDIF."},
  {input: "IF foo LE bar. ENDIF.", output: "IF foo <= bar. ENDIF."},
  {input: "IF foo LT bar. ENDIF.", output: "IF foo < bar. ENDIF."},
  {input: "SELECT * FROM foo INTO TABLE bar WHERE moo EQ boo.", output: "SELECT * FROM foo INTO TABLE bar WHERE moo = boo."},
];
testRuleFix(fixTests, PreferredCompareOperator);

const letterConfig = new PreferredCompareOperatorConf();
letterConfig.badOperators = ["=", "<>", "<=", "<", ">=", ">"];
const fixTestsLetters = [
  {output: "IF foo EQ bar. ENDIF.", input: "IF foo = bar. ENDIF."},
  {output: "IF foo NE bar. ENDIF.", input: "IF foo <> bar. ENDIF."},
  {output: "IF foo GT bar. ENDIF.", input: "IF foo > bar. ENDIF."},
  {output: "IF foo GE bar. ENDIF.", input: "IF foo >= bar. ENDIF."},
  {output: "IF foo LE bar. ENDIF.", input: "IF foo <= bar. ENDIF."},
  {output: "IF foo LT bar. ENDIF.", input: "IF foo < bar. ENDIF."},
  {output: "SELECT * FROM foo INTO TABLE bar WHERE moo EQ boo.", input: "SELECT * FROM foo INTO TABLE bar WHERE moo = boo."},
];
testRuleFix(fixTestsLetters, PreferredCompareOperator, letterConfig);