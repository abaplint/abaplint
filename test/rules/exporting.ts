import {Exporting} from "../../src/rules/exporting";
import {testRule} from "./_utils";

const tests = [
  {abap: "zcl_class=>methodname( EXPORTING iv_foo = '23' ).", cnt: 1},
  {abap: "zcl_class=>methodname( exporting iv_foo = '23' ).", cnt: 1},

  {abap: "zcl_class=>methodname( iv_foo = '23' ).", cnt: 0},
  {abap: "WRITE cl_abap_objectdescr=>exporting.", cnt: 0},
  {abap: "WRITE moo( cl_abap_objectdescr=>exporting ).", cnt: 0},
  {abap: "zcl_class=>methodname( importing ev_foo = bar ).", cnt: 0},
  {abap: "zcl_class=>methodname( exporting iv_foo = '23' importing ev_foo = bar ).", cnt: 0},
  {abap: "CALL METHOD lo_source->('FOOBAR') EXPORTING source = it_source.", cnt: 0},
  {abap: "CALL METHOD SUPER->CONSTRUCTOR EXPORTING TEXTID = TEXTID.", cnt: 0},
];

testRule(tests, Exporting);