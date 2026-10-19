import {Version} from "../../src";
import {CopyOfInitialVariable} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const tests: IRedundantTest[] = [
  {abap: inMethod("DATA v TYPE REF TO lcl.\nref = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE REF TO lcl.\nCLEAR v.\nref = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE REF TO lcl.\nCLEAR v.\nref = v.\nCLEAR v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE i.\nattr = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE string.\ntext = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE REF TO lsub.\nref = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE REF TO data.\nDATA d TYPE REF TO i.\nd ?= v.\nDATA e TYPE REF TO data.\ne = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nref->attr = v."), cnt: 1, fix: true},
  {abap: inMethod("FIELD-SYMBOLS <i> TYPE i.\nASSIGN attr TO <i>.\nDATA v TYPE i.\n<i> = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE i.\nDO 2 TIMES.\n  attr = v.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("IF imp = 1.\n  DATA v TYPE i.\nENDIF.\nattr = v."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA t26 TYPE REF TO lcl.
    DATA t27 TYPE REF TO lcl.
    CLEAR t27.
    t26 = t27.
    put( o = t26 ).`), cnt: 1, fix: true},

  // initial values convert between different types
  {abap: inMethod("DATA v TYPE d.\ntext = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE c LENGTH 2.\nDATA x TYPE c LENGTH 3.\nx = v.\nresult = strlen( x )."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\ntext = v."), cnt: 0},
  {abap: inMethod("FIELD-SYMBOLS <a> TYPE any.\nASSIGN attr TO <a>.\nDATA v TYPE i.\n<a> = v."), cnt: 0},
  // DATA(v) = VALUE t( ). is initial, also in loops
  {abap: inMethod("DATA(v) = VALUE i( ).\nattr = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA(v) = VALUE i( ).\nDO 2 TIMES.\n  CLEAR v.\n  attr = v.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("DO 2 TIMES.\n  DATA(v) = VALUE i( ).\nENDDO.\nattr = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA(v) = VALUE i( ).\nv = 1.\nattr = v."), cnt: 0},
  {abap: inMethod("DATA(v) = VALUE string( ).\nDATA x TYPE c LENGTH 3.\nx = v.\nresult = strlen( x )."), cnt: 0},
  {abap: inMethod("DATA(v) = VALUE i( ).\nDATA(x) = v.\nattr = x."), cnt: 0},
  // VALUE, writes, address taken
  {abap: inMethod("DATA v TYPE i VALUE 1.\nattr = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nv = 1.\nattr = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE c LENGTH 1.\nCLEAR v WITH 'X'.\nDATA x TYPE c LENGTH 1.\nx = v.\nresult = strlen( x )."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nch( CHANGING c = v ).\nattr = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nDATA(r) = REF #( v ).\nattr = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nGET REFERENCE OF v INTO DATA(r).\nattr = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nASSIGN v TO FIELD-SYMBOL(<fs>).\n<fs> = 2.\nattr = v."), cnt: 0},
  // other reads
  {abap: inMethod("DATA v TYPE i.\nattr = v.\nresult = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nattr = v + 1."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nDATA(x) = v.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA v TYPE REF TO lcl.\nDATA s TYPE REF TO lsub.\ns ?= v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nput( p = v )."), cnt: 0},
  {abap: inMethod("DATA: v TYPE i,\n      w TYPE i.\nattr = v.\nattr = w."), cnt: 0},
  {abap: inMethod("CLEAR attr.\nresult = attr."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA v TYPE i.\nattr = v.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _copy.\n  attr = &1.\nEND-OF-DEFINITION.\n" + inMethod("DATA v TYPE i.\n_copy v."), cnt: 0},
  {abap: inMethod("DATA v TYPE i.\nattr = v.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, CopyOfInitialVariable);
testSyntaxAfterFix(tests, CopyOfInitialVariable);

testRuleFix([
  {
    input: inMethod(`    DATA v TYPE REF TO lcl.
    CLEAR v.
    ref = v.`),
    output: inMethod(`    CLEAR ref.`),
  },
  {
    input: inMethod(`    DATA v TYPE i.
    ref->attr = v.`),
    output: inMethod(`    CLEAR ref->attr.`),
  },
  {
    input: inMethod(`    DO 2 TIMES.
      DATA(v) = VALUE i( ).
      attr = v.
    ENDDO.`),
    output: inMethod(`    DO 2 TIMES.
      CLEAR attr.
    ENDDO.`),
  },
], CopyOfInitialVariable);

testVersions(inMethod("DATA v TYPE i.\nattr = v."), CopyOfInitialVariable, [
  {version: Version.v702, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
