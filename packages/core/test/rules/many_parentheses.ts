import {ManyParentheses} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `WRITE nothing.`, cnt: 0},
  {abap: `IF ( destination IS INITIAL ). ENDIF.`, cnt: 1},
  {abap: `IF destination IS INITIAL. ENDIF.`, cnt: 0},
  {abap: `IF <field> IS INITIAL OR ( 1 = 2 ). ENDIF.`, cnt: 1},
  {abap: `IF ( field1 = '1' AND field2 = 'C' ). ENDIF.`, cnt: 1},
  {abap: `IF ( field1 = '1' OR field2 = 'C' ). ENDIF.`, cnt: 1},
  {abap: `IF NOT ( foo = bar ). ENDIF.`, cnt: 1},
  {abap: `IF iv_url CS 'a' AND ( iv_url CP 'b' OR iv_url CP 'c' ). ENDIF.`, cnt: 0},
  {abap: `IF iv_url CS 'a' AND ( iv_url CP 'b' AND iv_url CP 'c' ). ENDIF.`, cnt: 1},
  {abap: `IF ( subrc = 1 AND loc = true ) OR ( subrc = 2 AND loc = false ). ENDIF.`, cnt: 0},
  {abap: `IF ( subrc = 1 OR loc = true ) OR ( subrc = 2 OR loc = false ). ENDIF.`, cnt: 1},
  {abap: `IF ( ldate > ldate ) OR ( ldate = ldate AND ltime > ltime ). ENDIF.`, cnt: 1},
  {abap: `IF NOT ( foo = bar AND moo = loo ). ENDIF.`, cnt: 0},
  {abap: `IF foo = boo AND ( bar = lar AND moo = loo ). ENDIF.`, cnt: 1},
  {abap: `IF foo IS NOT INITIAL AND NOT ( moo = bar AND field IS INITIAL ). ENDIF.`, cnt: 0},
];

testRule(tests, ManyParentheses);
