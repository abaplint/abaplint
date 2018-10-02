import {ParserError} from "../../src/rules/parser_error";
import {testRule} from "./utils";

let tests = [
  {abap: "blah blah.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "##EXISTS\nENDMETHOD.", cnt: 0},
  {abap: "##needed.", cnt: 0},

  {abap: "ro_html->add('foo' && 'bar' ).", cnt: 1},
  {abap: "moo('sdf').", cnt: 1},
  {abap: "moo( bar).", cnt: 1},
  {abap: "moo( 'sdf' ).", cnt: 0},
  {abap: "moo( bar ).", cnt: 0},
  {abap: "moo( 'sdf').", cnt: 1}, // see differences between ABAP and abaplint
  {abap: "APPEND NEW lcl_foo( VALUE #( connid = '456') ) TO foos.", cnt: 1},
];

testRule(tests, "test parser_error rule", ParserError);