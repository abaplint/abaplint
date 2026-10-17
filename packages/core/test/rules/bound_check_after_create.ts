import {Version} from "../../src";
import {BoundCheckAfterCreate} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const tests: IRedundantTest[] = [
  // local variables
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCREATE OBJECT r.\nIF r IS BOUND.\n  r->put( ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF r IS BOUND.\n  r->put( ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nr = NEW #( ).\nIF r IS NOT BOUND.\n  RETURN.\nENDIF.\nr->put( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCREATE OBJECT r TYPE lsub.\nIF r IS BOUND.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nput( ).\nr->put( ).\nr->attr = 2.\nIF r IS BOUND.\n  result = 1.\nELSE.\n  result = 2.\nENDIF."), cnt: 1, fix: true},
  // attributes
  {abap: inMethod("CREATE OBJECT me->ref.\nref->attr = 1.\nDATA x TYPE REF TO lcl.\nCLEAR x.\nresult = 1.\nIF ref IS BOUND.\n  ref->put( ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("ref = NEW #( ).\nIF me->ref IS NOT BOUND.\n  RETURN.\nENDIF."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA(t1) = NEW lcl( ).
    CREATE OBJECT t1->ref.
    t1->ref->attr = 2.
    DATA t34 TYPE REF TO lcl.
    CLEAR t34.
    IF t1->ref IS BOUND.
      t1->ref->put( o = t34 ).
    ENDIF.
    DATA t35 TYPE REF TO lcl.
    CLEAR t35.
    IF t1->ref IS BOUND.
      t1->ref->put( o = t35 ).
    ENDIF.`), cnt: 1, fix: true},

  // local written in between, address taken
  {abap: inMethod("DATA(r) = NEW lcl( ).\nCLEAR r.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nr = iref.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nchref( CHANGING c = r ).\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nGET REFERENCE OF r INTO DATA(rr).\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nASSIGN r TO FIELD-SYMBOL(<r>).\nCLEAR <r>.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  // attribute: calls, constructors, writes that can change it
  {abap: inMethod("CREATE OBJECT ref.\nput( ).\nIF ref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("CREATE OBJECT ref.\nDATA(o) = NEW lcl( ).\nIF ref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(o) = NEW lcl( ).\nCREATE OBJECT ref.\no->ref = iref.\nIF ref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(t1) = NEW lcl( ).\nCREATE OBJECT t1->ref.\nt1 = iref.\nIF t1->ref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("ASSIGN ref TO FIELD-SYMBOL(<r>).\nCREATE OBJECT ref.\nCLEAR <r>.\nIF ref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("CREATE OBJECT ref.\nCLEAR ref.\nIF ref IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("CREATE OBJECT iref->ref.\nIF iref->ref IS BOUND.\nENDIF."), cnt: 0},
  // not straight-line in the same block
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF imp = 1.\nENDIF.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF imp = 1.\n  IF r IS BOUND.\n  ENDIF.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF imp = 1.\nELSEIF r IS BOUND.\nENDIF."), cnt: 0},
  // creation that can leave r initial
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCREATE OBJECT r EXCEPTIONS OTHERS = 1.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nr = NEW lcl( )->obj( ).\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nr = iref.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  // other conditions
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF r IS BOUND AND imp = 1.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF r IS INITIAL.\nENDIF."), cnt: 0},
  // a removed branch declares data used after the IF
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF r IS BOUND.\n  result = 1.\nELSE.\n  DATA(x) = 2.\nENDIF.\nresult = x."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCREATE OBJECT r TYPE ('LCL').\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: "DEFINE _create.\n  CREATE OBJECT &1.\nEND-OF-DEFINITION.\n" + inMethod("DATA r TYPE REF TO lcl.\n_create r.\nIF r IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(r) = NEW lcl( ).\nIF r IS BOUND.\nENDIF.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, BoundCheckAfterCreate);
testSyntaxAfterFix(tests, BoundCheckAfterCreate);

testRuleFix([
  {
    input: inMethod(`    DATA(r) = NEW lcl( ).
    IF r IS BOUND.
      r->put( ).
    ENDIF.`),
    output: inMethod(`    DATA(r) = NEW lcl( ).
      r->put( ).`),
  },
  {
    input: inMethod(`    CREATE OBJECT ref.
    IF ref IS NOT BOUND.
      RETURN.
    ELSE.
      ref->put( ).
    ENDIF.`),
    output: inMethod(`    CREATE OBJECT ref.
      ref->put( ).`),
  },
], BoundCheckAfterCreate);

testVersions(inMethod("DATA r TYPE REF TO lcl.\nCREATE OBJECT r.\nIF r IS BOUND.\nENDIF."), BoundCheckAfterCreate, [
  {version: Version.v702, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
