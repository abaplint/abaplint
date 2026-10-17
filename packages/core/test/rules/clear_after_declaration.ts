import {Version} from "../../src";
import {ClearAfterDeclaration} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const tests: IRedundantTest[] = [
  {abap: inMethod("DATA x TYPE i.\nCLEAR x."), cnt: 1, fix: true},
  {abap: inMethod("DATA x LIKE attr.\nCLEAR x.\nattr = x."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nattr = 2.\nCLEAR x.\nx = 1."), cnt: 1, fix: true},
  {abap: inMethod("IF attr = 1.\n  DATA x TYPE i.\nENDIF.\nCLEAR x."), cnt: 1, fix: true},
  {abap: inMethod("DATA: a TYPE i, b TYPE i.\nCLEAR: a, b."), cnt: 2, fix: true},
  {abap: inMethod("DATA x TYPE i.\nCLEAR: x, attr."), cnt: 1, fix: true},
  // uses after the CLEAR do not matter, the CLEAR always sees an initial x
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nch( CHANGING c = x )."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nGET REFERENCE OF x INTO DATA(dref)."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nASSIGN x TO FIELD-SYMBOL(<fs>)."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nDO 2 TIMES.\n  x = x + 1.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nTRY.\n    CLEAR x.\n  CATCH cx_root.\nENDTRY."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA t1 TYPE REF TO lcl.
    CLEAR t1.
    DATA t2 TYPE string.
    DATA(t3) = |abapdoc|.
    t2 = t3.
    t1 = NEW lcl( ).
    result = t1->get( ).`), cnt: 1, fix: true},
  {abap: inMethod(`    DATA t8 TYPE REF TO lcl.
    CLEAR t8.
    DATA t9 TYPE REF TO lcl.
    CLEAR t9.
    t8 = t9.`), cnt: 2, fix: true},

  // VALUE addition
  {abap: inMethod("DATA x TYPE i VALUE 2.\nCLEAR x."), cnt: 0},
  // written or read before the CLEAR
  {abap: inMethod("DATA x TYPE i.\nx = 1.\nCLEAR x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nattr = x.\nCLEAR x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nch( CHANGING c = x ).\nCLEAR x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nGET REFERENCE OF x INTO DATA(dref).\nCLEAR x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nASSIGN x TO FIELD-SYMBOL(<fs>).\nCLEAR x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nDATA(dref) = REF #( x ).\nCLEAR x."), cnt: 0},
  // loops
  {abap: inMethod("DO 2 TIMES.\n  DATA x TYPE i.\n  CLEAR x.\n  x = x + 1.\nENDDO."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nDO 2 TIMES.\n  CLEAR x.\n  x = x + 1.\nENDDO."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nWHILE attr < 2.\n  CLEAR x.\n  x = x + 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nLOOP AT tab INTO DATA(row).\n  CLEAR x.\n  x = x + row.\nENDLOOP."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nSELECT mandt FROM t000 INTO @DATA(client).\n  CLEAR x.\n  x = 1.\nENDSELECT."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nTRY.\n    CLEAR x.\n    x = 1.\n  CATCH cx_root.\n    RETRY.\nENDTRY."), cnt: 0},
  // other shapes of CLEAR, other kinds of variables
  {abap: inMethod("DATA x TYPE c LENGTH 2.\nCLEAR x WITH 'A'."), cnt: 0},
  {abap: inMethod("CLEAR attr."), cnt: 0},
  {abap: inMethod("CLEAR result."), cnt: 0},
  {abap: inMethod("STATICS s TYPE i.\nCLEAR s."), cnt: 0},
  {abap: inMethod("DATA(x) = 1.\nCLEAR x."), cnt: 0},
  {abap: inMethod("DATA: BEGIN OF s,\n  a TYPE i,\nEND OF s.\nCLEAR s."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x ##NEEDED."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nASSIGN ('X') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _clear.\n  CLEAR &1.\nEND-OF-DEFINITION.\n" + inMethod("DATA x TYPE i.\nCLEAR x.\n_clear x."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nCLEAR x.\nunknown = 1."), cnt: 0, syntaxError: true},
  {abap: "parser error.", cnt: 0, syntaxError: true},
];

testRule(tests, ClearAfterDeclaration);
testSyntaxAfterFix(tests, ClearAfterDeclaration);

testRuleFix([
  {input: inMethod("    DATA x TYPE i.\n    CLEAR x.\n    attr = x."), output: inMethod("    DATA x TYPE i.\n    attr = x.")},
  {input: inMethod("    DATA x TYPE i. CLEAR x.\n    attr = x."), output: inMethod("    DATA x TYPE i. \n    attr = x.")},
  {input: inMethod("    DATA x TYPE i.\n    CLEAR x. \" comment\n    attr = x."), output: inMethod("    DATA x TYPE i.\n     \" comment\n    attr = x.")},
  {input: inMethod("    DATA x TYPE i.\n    CLEAR: x, attr."), output: inMethod("    DATA x TYPE i.\n    CLEAR: attr.")},
  {input: "FORM example.\n  DATA x TYPE i.\n  CLEAR x.\nENDFORM.", output: "FORM example.\n  DATA x TYPE i.\nENDFORM."},
], ClearAfterDeclaration);

testVersions(inMethod("DATA x TYPE i.\nCLEAR x."), ClearAfterDeclaration, [
  {version: Version.v702, cnt: 1},
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
