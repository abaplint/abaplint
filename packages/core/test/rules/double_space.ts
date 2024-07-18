import {testRule, testRuleFix} from "./_utils";
import {DoubleSpace, DoubleSpaceConf} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "IF  foo = bar.", cnt: 1},
  {abap: "IF foo = bar.", cnt: 0},
  {abap: "IF foo EQ  bar.", cnt: 1},
  {abap: "IF NOT  me->is_class_pool( me->program_name ) EQ abap_true.", cnt: 1},
  {abap: "call( var ).", cnt: 0},
  {abap: "call(  var ).", cnt: 1},
  {abap: "call( var  ).", cnt: 1},
  {abap: "call(  var  ).", cnt: 2},
  {abap: "DATA: foo TYPE c.", cnt: 0},
  {abap: "DATA: foo TYPE c,\nmoo TYPE c.", cnt: 0},
  {abap: "DATA:  foo TYPE c.", cnt: 1},
  {abap: "CLEAR: foo, bar.", cnt: 0},
  {abap: "call(  \"comment\n).", cnt: 0},
  {abap: "foo = |  )|.", cnt: 0},
  {abap: "call( |hello| ).", cnt: 0},
  {abap: "call(  ).", cnt: 1}, // call with empty parameters should only report once
  {abap: "call( |moo {\nvar }bar| ).", cnt: 0},
  {abap: "CLASS zsdfsdf DEFINITION PUBLIC  ABSTRACT FINAL CREATE PUBLIC.", cnt: 1},
  {abap: "CLASS-METHODS class_includes RETURNING VALUE(rt_programs)     TYPE scit_program.", cnt: 0},
  {abap: "foo = call( bar ) ##pragma.", cnt: 0},
  {abap: `CALL FUNCTION 'ZFOOBAR'
  EXCEPTIONS
    excecution_error       = 1
    cancelled              = 2
    insert_into_corr_error = 3
    OTHERS                 = 4.`, cnt: 0},

  {abap:
    "_get_1st_child_commit( EXPORTING it_commit_sha1s = lt_parents\n" +
    "                       IMPORTING et_commit_sha1s = lt_parents\n" +
    "                                 es_1st_commit   = ls_next_commit\n" +
    "                       CHANGING  ct_commits      = ct_commits ).", cnt: 0},
  {abap: "call(  |moo {\nvar }bar| ).", cnt: 1},
  {abap: `
EVENTS sdfs
  EXPORTING
    VALUE(sdf)        TYPE c
    VALUE(fdsdfdsdsf) TYPE i.`, cnt: 0},
  {abap: `
DATA(my_variable) = 0.
DATA(my_var_01)   = 0.
DATA(my_var_2)    = 0.`, cnt: 0},
  {abap: `
your_variable = 0.
your_var_01   = 0.
your_var_2    = 0.`, cnt: 0},
  {abap: `test_type = VALUE #( enum_component =  'AA' ).`, cnt: 1},
  {abap: `test_type = VALUE #( enum_component =    'AA' ).`, cnt: 1},
  {abap: `i_error_text = VALUE #( |sdfsd| ##NO_TEXT ).`, cnt: 0},
];

testRule(tests, DoubleSpace);

const testsSkips = [
  {abap: `WRITE  bar.`, cnt: 0},
];
const skipConf = new DoubleSpaceConf();
skipConf.skipKeywords = ["write"];
testRule(testsSkips, DoubleSpace, skipConf);


const fixes = [
  // after colon
  {input: "DATA:  foo TYPE c.", output: "DATA: foo TYPE c."},
  // left of parenthesis
  {input: "call( var     ).", output: "call( var )."},
  // right of parenthesis
  {input: "call(     var ).", output: "call( var )."},
  // after keyword
  {input: "REPORT     zfoobar.", output: "REPORT zfoobar."},
];

testRuleFix(fixes, DoubleSpace);