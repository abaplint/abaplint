import {ManyParentheses} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0, fix: false},
  {abap: `WRITE nothing.`, cnt: 0, fix: false},
  {abap: `IF ( destination IS INITIAL ). ENDIF.`, cnt: 1, fix: true},
  {abap: `IF destination IS INITIAL. ENDIF.`, cnt: 0, fix: false},
  {abap: `IF <field> IS INITIAL OR ( 1 = 2 ). ENDIF.`, cnt: 1, fix: true},
  {abap: `IF ( field1 = '1' AND field2 = 'C' ). ENDIF.`, cnt: 1, fix: false},
  {abap: `IF ( field1 = '1' OR field2 = 'C' ). ENDIF.`, cnt: 1, fix: false},
  {abap: `IF NOT ( foo = bar ). ENDIF.`, cnt: 1, fix: true},
  {abap: `IF iv_url CS 'a' AND ( iv_url CP 'b' OR iv_url CP 'c' ). ENDIF.`, cnt: 0, fix: false},
  {abap: `IF iv_url CS 'a' AND ( iv_url CP 'b' AND iv_url CP 'c' ). ENDIF.`, cnt: 1, fix: false},
  {abap: `IF ( type <> 'P' AND type <> 'S' AND type <> 'G' ) AND from <= limit. ENDIF.`, cnt: 1, fix: false},
  {abap: `IF type <> 'P' AND ( type <> 'S' AND type <> 'G' ) AND from <= limit. ENDIF.`, cnt: 1, fix: false},
  {abap: `IF type <> 'P' AND ( type <> 'S' AND type <> 'G' AND from <= limit ). ENDIF.`, cnt: 1, fix: false},
  {abap: `IF ( subrc = 1 AND loc = true ) OR ( subrc = 2 AND loc = false ). ENDIF.`, cnt: 0, fix: false},
  {abap: `IF ( subrc = 1 OR loc = true ) OR ( subrc = 2 OR loc = false ). ENDIF.`, cnt: 1, fix: false},
  {abap: `IF ( ldate > ldate ) OR ( ldate = ldate AND ltime > ltime ). ENDIF.`, cnt: 1, fix: true},
  {abap: `IF NOT ( foo = bar AND moo = loo ). ENDIF.`, cnt: 0, fix: false},
  {abap: `IF foo = boo AND ( bar = lar AND moo = loo ). ENDIF.`, cnt: 1, fix: false},
  {abap: `IF foo IS NOT INITIAL AND NOT ( moo = bar AND field IS INITIAL ). ENDIF.`, cnt: 0, fix: false},
  {abap: `ls_draw = ( lt_draw[ doknr = <fs_dir>-doknr ] ).`, cnt: 1, fix: false},
  {abap: `DATA l_vsart TYPE tvro-vsart.
SELECT SINGLE vsart INTO (l_vsart) FROM tvro.`, cnt: 1, fix: false},
  {abap: `DATA l_vsart TYPE tvro-vsart.
SELECT SINGLE vsart INTO l_vsart FROM tvro.`, cnt: 0, fix: false},
  {abap: `SELECT SINGLE vsart INTO @DATA(l_vsart) FROM tvro.`, cnt: 0, fix: false},
  {abap: `LOOP AT tab_statements ASSIGNING <fs_stmnt_tmp> WHERE ( type <> 'P' AND type <> 'S' AND type <> 'G' ) AND from <= limit.
ENDLOOP.`, cnt: 1, fix: false},
  {abap: `LOOP AT tab_statements ASSIGNING <fs_stmnt_tmp> WHERE ( type <> 'P' AND type <> 'S' AND type <> 'G' ).
ENDLOOP.`, cnt: 1, fix: false},
/*
  {abap: `LOOP AT tab_statements ASSIGNING <fs_stmnt_tmp> WHERE ( type <> 'P' ).
ENDLOOP.`, cnt: 1, fix: true},
*/
  {abap: `LOOP AT tab_statements ASSIGNING <fs_stmnt_tmp> WHERE type <> 'P' AND type <> 'S' AND type <> 'G' AND from <= limit.
ENDLOOP.`, cnt: 0, fix: false},
];

testRule(tests, ManyParentheses);

const fixes = [
  {input: `IF ( destination IS INITIAL ). ENDIF.`, output: `IF destination IS INITIAL. ENDIF.`},
  {input: `IF ( ldate > ldate ) OR ( ldate = ldate AND ltime > ltime ). ENDIF.`,
    output: `IF ldate > ldate OR ( ldate = ldate AND ltime > ltime ). ENDIF.`},
  {input: `IF <field> IS INITIAL OR ( 1 = 2 ). ENDIF.`, output: `IF <field> IS INITIAL OR 1 = 2. ENDIF.`},
];

testRuleFix(fixes, ManyParentheses);