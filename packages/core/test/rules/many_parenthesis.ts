import {ManyParenthesis} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `WRITE nothing.`, cnt: 0},
  {abap: `IF ( destination IS INITIAL ). ENDIF.`, cnt: 1},
  {abap: `IF destination IS INITIAL. ENDIF.`, cnt: 0},
  {abap: `IF <field> IS INITIAL OR ( CONV string( <field> ) = '' ). ENDIF.`, cnt: 1},
//  {abap: `IF ( ls_t000-cccoractiv = '1' AND ls_t000-cccategory = 'C' ). ENDIF.`, cnt: 1},
  {abap: `IF NOT ( foo = bar ). ENDIF.`, cnt: 1},
];

testRule(tests, ManyParenthesis);
