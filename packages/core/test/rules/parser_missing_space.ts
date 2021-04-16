import {testRule} from "./_utils";
import {ParserMissingSpace} from "../../src/rules/parser_missing_space";

const tests = [
  {abap: "ro_html->add('foo' && 'bar' ).", cnt: 1},
  {abap: "moo('sdf').", cnt: 1},
  {abap: "moo( bar).", cnt: 1},
  {abap: "moo( 'sdf' ).", cnt: 0},
  {abap: "moo( bar ).", cnt: 0},
  {abap: "moo( 'sdf').", cnt: 1},
  {abap: "moo('sdf' ).", cnt: 1},
  {abap: "PERFORM ('DYNAMIC').", cnt: 0},
  {abap: "IF ( foo = 'bar').", cnt: 1},
  {abap: "IF ( foo = 'bar' ).", cnt: 0},
  {abap: "IF (foo = 'bar' ).", cnt: 1},
  {abap: "IF (method( ) = 2 ).", cnt: 1},
  {abap: "IF token-str EQ'RETURNING'. ENDIF.", cnt: 1},
  {abap: "IF bar ='RETURNING'. ENDIF.", cnt: 1},
  {abap: "IF token-str EQ 'RETURNING'. ENDIF.", cnt: 0},
  {abap: "IF bar = 'RETURNING'. ENDIF.", cnt: 0},
  {abap: "DATA(test) = VALUE string_table( ( `( 1 =`) ).", cnt: 1},
  {abap: "DATA(test) = VALUE string_table( (`( 1 =` ) ).", cnt: 1},
  {abap: "DATA(test) = VALUE string_table( ( `( 1 =` ) ).", cnt: 0},
  {abap: `SELECT * FROM t100 WHERE ( msgnr BETWEEN '001' AND '010' OR msgnr = '050').`, cnt: 1},
  {abap: `SELECT * FROM t100 WHERE ( msgnr BETWEEN '001' AND '010' OR msgnr = '050' ).`, cnt: 0},
];

testRule(tests, ParserMissingSpace);