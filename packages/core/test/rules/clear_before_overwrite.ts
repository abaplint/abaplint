import {Version} from "../../src";
import {ClearBeforeOverwrite} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const tests: IRedundantTest[] = [
  {abap: inMethod("DATA t137 TYPE string.\nDATA t125 TYPE string.\nt125 = text.\nCLEAR t137.\nt137 = t125.\ntext = t137."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nDO 2 TIMES.\n  CLEAR x.\n  x = get( ).\n  attr = x.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nput( ).\nattr = 2.\nx = get( ).\nattr = x."), cnt: 1, fix: true},
  {abap: inMethod("DATA(x) = get( ).\nattr = x.\nCLEAR x.\nx = get( ).\nattr = x."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCLEAR r.\nr = NEW #( ).\nref = r."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCLEAR r.\nCREATE OBJECT r EXPORTING s = text.\nref = r."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCLEAR r.\nCREATE OBJECT r TYPE lsub.\nref = r."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nIF val = 1.\n  CLEAR x.\n  x = 2.\nENDIF.\nattr = x."), cnt: 1, fix: true},
  // passed by value
  {abap: inMethod("DATA x TYPE i.\nstr( v = x ).\nCLEAR x.\nx = 1.\nattr = x."), cnt: 1, fix: true},
  // in TRY: nothing between, and the overwrite cannot raise an exception
  {abap: inMethod("DATA x TYPE i.\nDATA y TYPE i.\ny = attr.\nTRY.\n    CLEAR x.\n    x = y.\n    attr = x.\n  CATCH cx_root.\nENDTRY."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nTRY.\n    CLEAR x.\n    x = 5.\n    attr = x.\n  CATCH cx_root.\nENDTRY."), cnt: 1, fix: true},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nTRY.\n    CLEAR r.\n    r = iref.\n  CATCH cx_root.\nENDTRY.\nref = r."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nTRY.\n    CLEAR x.\n    put( ).\n    x = 5.\n  CATCH cx_root.\nENDTRY.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nTRY.\n    CLEAR x.\n    x = get( ).\n  CATCH cx_root.\nENDTRY.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nTRY.\n    CLEAR x.\n    x = text.\n  CATCH cx_root.\nENDTRY.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nTRY.\n    CLEAR r.\n    r = NEW #( ).\n  CATCH cx_root.\nENDTRY.\nref = r."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nTRY.\n    put( ).\n  CATCH cx_root.\n    CLEAR x.\n    x = get( ).\nENDTRY.\nattr = x."), cnt: 0},

  // the address of v is taken, or v is passed by reference
  {abap: inMethod("DATA x TYPE i.\nGET REFERENCE OF x INTO DATA(r).\nCLEAR x.\nx = 1.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nASSIGN x TO FIELD-SYMBOL(<fs>).\nCLEAR x.\nx = 1.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nput( p = x ).\nCLEAR x.\nx = 1.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA s TYPE string.\nref = NEW lcl( s = s ).\nCLEAR s.\ns = text.\ntext = s."), cnt: 0},
  {abap: inMethod("DATA s TYPE string.\nCREATE OBJECT ref EXPORTING s = s.\nCLEAR s.\ns = text.\ntext = s."), cnt: 0},
  // other CLEARs
  {abap: inMethod("DATA x TYPE i.\nCLEAR: x.\nx = 1.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE c LENGTH 2.\nCLEAR x WITH 'a'.\nx = 'bc'.\ntext = x."), cnt: 0},
  // the next reference is not a full overwrite that does not read v
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nattr = x.\nx = 1.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nx = x + 1.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nx = get( p = x ).\nattr = x."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lsub.\nCLEAR r.\nr ?= iref.\nref = r."), cnt: 0},
  {abap: inMethod("TYPES: BEGIN OF ty,\n  c TYPE i,\nEND OF ty.\nDATA s TYPE ty.\nCLEAR s.\ns-c = 1.\nattr = s-c."), cnt: 0},
  {abap: inMethod("DATA c TYPE c LENGTH 5.\nCLEAR c.\nc+1(2) = 'ab'.\ntext = c."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nREAD TABLE tab INDEX 1 INTO x.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nex( IMPORTING e = x ).\nattr = x."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCLEAR r.\nCREATE OBJECT r EXCEPTIONS OTHERS = 1.\nref = r."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO lcl.\nCLEAR r.\nCREATE OBJECT r EXPORTING s = r->text.\nref = r."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nIF val = 1.\n  x = 1.\nENDIF.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nIF val = 1.\n  put( ).\nENDIF.\nx = 1.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nattr = x.\nDO 2 TIMES.\n  x = 1.\nENDDO."), cnt: 0},
  {abap: "FORM f.\n  DATA itab TYPE i OCCURS 0 WITH HEADER LINE.\n  CLEAR itab.\n  itab = 5.\n  APPEND itab.\nENDFORM.", cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nx = 1.\nattr = x.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _set.\n  &1 = 1.\nEND-OF-DEFINITION.\n" + inMethod("DATA x TYPE i.\nCLEAR x.\n_set x.\nattr = x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nx = 1.\nattr = x.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, ClearBeforeOverwrite);
testSyntaxAfterFix(tests, ClearBeforeOverwrite);

testRuleFix([
  {
    input: inMethod(`    DATA x TYPE i.
    DO 2 TIMES.
      CLEAR x.
      x = get( ).
      attr = x.
    ENDDO.`),
    output: inMethod(`    DATA x TYPE i.
    DO 2 TIMES.
      x = get( ).
      attr = x.
    ENDDO.`),
  },
], ClearBeforeOverwrite);

testVersions(inMethod("DATA x TYPE i.\nCLEAR x.\nx = 1.\nattr = x."), ClearBeforeOverwrite, [
  {version: Version.v702, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
