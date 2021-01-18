import {testRule, testRuleFix} from "./_utils";
import {PreferIsNot} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0, fix: false},
  {abap: "CREATE OBJECT foobar.", cnt: 0, fix: false},

  {abap: "IF variable IS NOT INITIAL. ENDIF.", cnt: 0, fix: false},
  {abap: "IF variable NP 'TODO*'. ENDIF.", cnt: 0, fix: false},
  {abap: "IF variable <> 42. ENDIF.", cnt: 0, fix: false},

  {abap: "IF NOT variable IS INITIAL. ENDIF.", cnt: 1, fix: true},
  {abap: "IF NOT variable CP 'TODO*'. ENDIF.", cnt: 1, fix: false},
  {abap: "IF NOT variable = 42. ENDIF.", cnt: 1, fix: true},
  {abap: "IF foo = bar AND NOT variable = 42. ENDIF.", cnt: 1, fix: true},
  {abap: "WHILE NOT variable IS INITIAL. ENDWHILE.", cnt: 1, fix: true},
  {abap: "foo = boolc( NOT variable = 42 ).", cnt: 1, fix: true},

  {abap: `if not is_valid( ). endif.`, cnt: 0, fix: false},
];

testRule(tests, PreferIsNot);

const fixes = [
  {input: "foo = boolc( NOT variable = 42 ).", output: "foo = boolc( variable <> 42 )."},
  {input: "IF foo = bar AND NOT variable = 42. ENDIF.", output: "IF foo = bar AND variable <> 42. ENDIF."},
  {input: "IF NOT variable = 42. ENDIF.", output: "IF variable <> 42. ENDIF."},
  {input: "IF NOT variable <> 42. ENDIF.", output: "IF variable = 42. ENDIF."},
  {input: "IF NOT variable < 42. ENDIF.", output: "IF variable > 42. ENDIF."},
  {input: "IF NOT variable > 42. ENDIF.", output: "IF variable < 42. ENDIF."},
  {input: "IF NOT variable <= 42. ENDIF.", output: "IF variable >= 42. ENDIF."},
  {input: "IF NOT variable >= 42. ENDIF.", output: "IF variable <= 42. ENDIF."},
  {input: "IF NOT variable IS INITIAL. ENDIF.", output: "IF variable IS NOT INITIAL. ENDIF."},
  {input: "WHILE NOT variable IS INITIAL. ENDWHILE.", output: "WHILE variable IS NOT INITIAL. ENDWHILE."},
  {input: "IF NOT variable BETWEEN 42 AND 42. ENDIF.", output: "IF variable NOT BETWEEN 42 AND 42. ENDIF."},
  {input: "IF NOT variable IN range. ENDIF.", output: "IF variable NOT IN range. ENDIF."},
];

testRuleFix(fixes, PreferIsNot);
