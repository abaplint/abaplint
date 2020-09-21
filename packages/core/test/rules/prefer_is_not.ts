import {testRule} from "./_utils";
import {PreferIsNot} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CREATE OBJECT foobar.", cnt: 0},

  {abap: "IF variable IS NOT INITIAL. ENDIF.", cnt: 0},
  {abap: "IF variable NP 'TODO*'. ENDIF.", cnt: 0},
  {abap: "IF variable <> 42. ENDIF.", cnt: 0},

  {abap: "IF NOT variable IS INITIAL. ENDIF.", cnt: 1},
  {abap: "IF NOT variable CP 'TODO*'. ENDIF.", cnt: 1},
  {abap: "IF NOT variable = 42. ENDIF.", cnt: 1},
  {abap: "IF foo = bar AND NOT variable = 42. ENDIF.", cnt: 1},
  {abap: "WHILE NOT variable IS INITIAL. ENDWHILE.", cnt: 1},
  {abap: "foo = boolc( NOT variable = 42 ).", cnt: 1},

  {abap: `if not is_valid( ). endif.`, cnt: 0},
];

testRule(tests, PreferIsNot);
