import {Version} from "../../src";
import {CopyChain} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const chain = (body: string) => inMethod("DATA src TYPE REF TO lcl.\nsrc = NEW #( ).\nDATA v TYPE REF TO lcl.\n" + body);

const tests: IRedundantTest[] = [
  {abap: chain("v = src.\nref = v."), cnt: 1, fix: true},
  {abap: chain("CLEAR v.\nv = src.\nref = v."), cnt: 1, fix: true},
  {abap: chain("CLEAR v.\nput( ).\nv = src.\nattr = 2.\nref = v."), cnt: 1, fix: true},
  {abap: chain("v = src.\nIF imp = 1.\n  ref = v.\nENDIF."), cnt: 1, fix: true},
  {abap: chain("DO 2 TIMES.\n  v = src.\n  ref = v.\nENDDO."), cnt: 1, fix: true},
  {abap: chain("v = src.\nref->ref = v."), cnt: 1, fix: true},
  // DATA(v) = VALUE t( ). as declaration
  {abap: inMethod("DATA src TYPE i.\nsrc = attr.\nDATA(v) = VALUE i( ).\nv = src.\nattr = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA src TYPE i.\nsrc = attr.\nDATA(v) = VALUE f( ).\nv = src.\nattr = v."), cnt: 0},
  // pass-by-value parameter as src, by reference parameters can change
  {abap: inMethod("DATA v TYPE i.\nv = val.\nattr = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA v TYPE i.\nv = imp.\nattr = v."), cnt: 0},
  // up casts stay valid
  {abap: inMethod("DATA src TYPE REF TO lsub.\nDATA v TYPE REF TO lcl.\nv = src.\nDATA o TYPE REF TO object.\no = v.\nref ?= o."), cnt: 1, fix: true},
  {abap: inMethod("DATA src TYPE REF TO i.\nDATA v TYPE REF TO data.\nv = src.\nDATA d TYPE REF TO data.\nd = v.\nCLEAR d."), cnt: 1, fix: true},
  // identical value types
  {abap: inMethod("DATA src TYPE string.\nsrc = text.\nDATA v TYPE string.\nv = src.\ntext = v."), cnt: 1, fix: true},
  {abap: inMethod("DATA src TYPE c LENGTH 10.\nsrc = text.\nDATA v TYPE c LENGTH 10.\nv = src.\ntext = v."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA t17 TYPE REF TO lcl.
    DATA t18 TYPE REF TO lcl.
    DATA t19 TYPE REF TO lcl.
    CREATE OBJECT t19.
    t18 = t19.
    DATA(t24) = t18.
    t17 = t24.
    ref = t17.`), cnt: 3, fix: true},

  // types that can convert
  {abap: inMethod("DATA src TYPE string.\nsrc = text.\nDATA v TYPE c LENGTH 10.\nv = src.\ntext = v."), cnt: 0},
  {abap: inMethod("DATA src TYPE i.\nsrc = attr.\nDATA v TYPE p LENGTH 10 DECIMALS 2.\nv = src.\nattr = v."), cnt: 0},
  // src changed in between
  {abap: chain("v = src.\nsrc = NEW #( ).\nref = v."), cnt: 0},
  {abap: chain("v = src.\nCLEAR src.\nref = v."), cnt: 0},
  {abap: chain("v = src.\nchref( CHANGING c = src ).\nref = v."), cnt: 0},
  {abap: chain("v = src.\nref = v.\nGET REFERENCE OF src INTO DATA(r)."), cnt: 0},
  {abap: chain("ASSIGN src TO FIELD-SYMBOL(<fs>).\nv = src.\nCLEAR <fs>.\nref = v."), cnt: 0},
  {abap: inMethod("DATA v TYPE REF TO lcl.\nv = ref.\nref = NEW #( ).\nDATA o TYPE REF TO lcl.\no = v.\nput( o = o ).\nput( o = o )."), cnt: 0},
  // more references to v
  {abap: chain("v = src.\nv = src.\nref = v."), cnt: 0},
  {abap: chain("v = src.\nref = v.\nref = v."), cnt: 0},
  {abap: chain("v = src.\nCLEAR v.\nref = v."), cnt: 0},
  {abap: chain("v = src.\nASSIGN v TO FIELD-SYMBOL(<fs>).\nref = v."), cnt: 0},
  {abap: chain("v = src.\nchref( CHANGING c = v ).\nref = v."), cnt: 0},
  {abap: chain("v = src.\nDATA(r) = REF #( v ).\nref = v."), cnt: 0},
  // not executed on every path, or in another loop
  {abap: chain("IF imp = 1.\n  v = src.\nENDIF.\nref = v."), cnt: 0},
  {abap: chain("v = src.\nDO 2 TIMES.\n  ref = v.\nENDDO."), cnt: 0},
  // other shapes
  {abap: chain("v = src.\nref = v->obj( )."), cnt: 0},
  // inline target: only with identical types
  {abap: chain("v = src.\nDATA(o) = v.\nref = o."), cnt: 1, fix: true},
  {abap: inMethod("DATA src TYPE REF TO lsub.\nDATA v TYPE REF TO lcl.\nv = src.\nDATA(o) = v.\nref = o."), cnt: 0},
  {abap: inMethod("DATA src TYPE string.\nDATA v TYPE string.\nv = src.\nDATA(o) = v.\ntext = o."), cnt: 1, fix: true},
  {abap: chain("v = src.\nDATA s TYPE REF TO lsub.\ns ?= v."), cnt: 0},
  {abap: chain("v ?= src.\nref = v."), cnt: 0},
  {abap: chain("v = src->obj( ).\nref = v."), cnt: 0},
  {abap: inMethod("DATA src TYPE i.\nsrc = attr.\nDATA v TYPE i VALUE 5.\nv = src.\nattr = v."), cnt: 0},
  {abap: inMethod("DATA: src TYPE REF TO lcl,\n      v TYPE REF TO lcl.\nv = src.\nref = v."), cnt: 0},
  // CREATE OBJECT a. b = a.
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nb = a.\nput( o = b )."), cnt: 1, fix: true},
  {abap: inMethod("DATA b TYPE REF TO lif.\nDATA a TYPE REF TO lsub.\nCREATE OBJECT a EXPORTING s = text.\nb = a.\nput( o = CAST lcl( b ) )."), cnt: 1, fix: true},
  {abap: inMethod("DATA b TYPE REF TO object.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nb = a.\nref ?= b."), cnt: 1, fix: true},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a TYPE lsub.\nb = a.\nput( o = b )."), cnt: 1, fix: true},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nDATA c TYPE i.\nb = a.\nput( o = b ).\nCLEAR c."), cnt: 1, fix: true},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nIF val = 1.\n  DATA a TYPE REF TO lcl.\n  CREATE OBJECT a.\n  b = a.\nENDIF.\nput( o = b )."), cnt: 1, fix: true},
  {abap: inMethod("DATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nref = a."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nGET REFERENCE OF b INTO DATA(r).\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nb = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nb = NEW #( ).\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a EXPORTING s = b->text.\nb = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nDATA b TYPE REF TO lcl.\nb = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nDATA(b) = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nput( ).\nb = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nb = a.\nref = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCLEAR a.\nCREATE OBJECT a.\nb = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a EXCEPTIONS OTHERS = 1.\nb = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lsub.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT a.\nb ?= a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA a TYPE REF TO lcl.\nCREATE OBJECT: a.\nb = a.\nput( o = b )."), cnt: 0},
  {abap: inMethod("DATA b TYPE REF TO lcl.\nDATA: a TYPE REF TO lcl,\n      c TYPE i.\nCREATE OBJECT a.\nb = a.\nput( o = b ).\nCLEAR c."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: chain("v = src.\nref = v.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _copy.\n  ref = &1.\nEND-OF-DEFINITION.\n" + chain("v = src.\n_copy v."), cnt: 0},
  {abap: chain("v = src.\nref = v.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, CopyChain);
testSyntaxAfterFix(tests, CopyChain);

testRuleFix([
  {
    input: inMethod(`    DATA src TYPE REF TO lcl.
    DATA v TYPE REF TO lcl.
    CLEAR v.
    v = src.
    ref = v.`),
    output: inMethod(`    DATA src TYPE REF TO lcl.
    ref = src.`),
  },
  {
    input: inMethod(`    DATA src TYPE REF TO lcl.
    DATA v TYPE REF TO lcl.
    v = src.
    IF imp = 1.
      ref = v.
    ENDIF.`),
    output: inMethod(`    DATA src TYPE REF TO lcl.
    IF imp = 1.
      ref = src.
    ENDIF.`),
  },
  {
    input: inMethod(`    DATA t9 TYPE REF TO lif.
    DATA t10 TYPE REF TO lsub.
    CREATE OBJECT t10 EXPORTING s = text.
    t9 = t10.
    put( o = CAST lcl( t9 ) ).`),
    output: inMethod(`    DATA t9 TYPE REF TO lif.
    CREATE OBJECT t9 TYPE lsub EXPORTING s = text.
    put( o = CAST lcl( t9 ) ).`),
  },
  {
    input: inMethod(`    DATA t9 TYPE REF TO lcl.
    DATA t10 TYPE REF TO lcl.
    CREATE OBJECT t10.
    t9 = t10.
    put( o = t9 ).`),
    output: inMethod(`    DATA t9 TYPE REF TO lcl.
    CREATE OBJECT t9.
    put( o = t9 ).`),
  },
], CopyChain);

testVersions(inMethod("DATA src TYPE REF TO lcl.\nDATA v TYPE REF TO lcl.\nv = src.\nref = v."), CopyChain, [
  {version: Version.v702, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
