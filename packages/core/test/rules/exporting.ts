import {Exporting} from "../../src/rules/exporting";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "zcl_class=>methodname( EXPORTING iv_foo = '23' ).", cnt: 1},
  {abap: "zcl_class=>methodname( exporting iv_foo = '23' ).", cnt: 1},

  {abap: "zcl_class=>methodname( iv_foo = '23' ).", cnt: 0},
  {abap: "zcl_class=>methodname( '23' ).", cnt: 0},
  {abap: "WRITE cl_abap_objectdescr=>exporting.", cnt: 0},
  {abap: "WRITE moo( cl_abap_objectdescr=>exporting ).", cnt: 0},
  {abap: "zcl_class=>methodname( importing ev_foo = bar ).", cnt: 0},
  {abap: "zcl_class=>methodname( exporting iv_foo = '23' importing ev_foo = bar ).", cnt: 0},
  {abap: "CALL METHOD lo_source->('FOOBAR') EXPORTING source = it_source.", cnt: 0},
  {abap: "CALL METHOD SUPER->CONSTRUCTOR EXPORTING TEXTID = TEXTID.", cnt: 0},
];

testRule(tests, Exporting);

const fixes = [
  {input: "methodname( EXPORTING iv_foo = '1' ).", output: "methodname( iv_foo = '1' )."},
  {input: "methodname( EXPORTING  iv_foo = '2' ).", output: "methodname( iv_foo = '2' )."},
  {input: "methodname(  EXPORTING iv_foo = '3' ).", output: "methodname(  iv_foo = '3' )."},
  {input: "methodname( EXPORTING\niv_foo = '4' ).", output: "methodname( iv_foo = '4' )."},
  {input: "methodname( EXPORTING\n\niv_foo = '5' ).", output: "methodname( iv_foo = '5' )."},
];

testRuleFix(fixes, Exporting);