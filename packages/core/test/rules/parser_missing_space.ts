import {testRule} from "./_utils";
import {ParserMissingSpace} from "../../src/rules/parser_missing_space";

const tests = [
  /*
  {abap: "ro_html->add('foo' && 'bar' ).", cnt: 1},
  {abap: "moo('sdf').", cnt: 1},
  {abap: "moo( bar).", cnt: 1},
  {abap: "moo( 'sdf' ).", cnt: 0},
  {abap: "moo( bar ).", cnt: 0},
  {abap: "moo( 'sdf').", cnt: 1},
  */
  {abap: "PERFORM ('DYNAMIC').", cnt: 0},
  {abap: "IF ( foo = 'bar').", cnt: 1},
  {abap: "IF ( foo = 'bar' ).", cnt: 0},
  {abap: "IF (foo = 'bar' ).", cnt: 1},
  {abap: "IF (method( ) = 2 ).", cnt: 1},
];

testRule(tests, ParserMissingSpace);