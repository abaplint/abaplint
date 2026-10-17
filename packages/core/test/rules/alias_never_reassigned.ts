import {Version} from "../../src";
import {AliasNeverReassigned} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const local = (body: string) => inMethod("DATA x TYPE i.\nx = imp.\n" + body);

const tests: IRedundantTest[] = [
  {abap: inMethod("DATA x TYPE REF TO lcl.\nx = NEW #( ).\nDATA(a) = x.\na->put( ).\nresult = a->get( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = me.\na->put( ).\na->put( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = lcl=>co.\nresult = a.\nattr = a."), cnt: 1, fix: true},
  {abap: inMethod("TYPES: BEGIN OF ty,\n  c TYPE i,\nEND OF ty.\nDATA s TYPE ty.\nDATA(a) = s-c.\nresult = a.\nattr = a."), cnt: 1, fix: true},
  {abap: local("DATA(a) = x.\nIF imp = 1.\n  result = a.\nENDIF.\nDO 2 TIMES.\n  attr = a.\nENDDO."), cnt: 1, fix: true},
  {abap: local("x = 2.\nDATA(a) = x.\nput( ).\nresult = a.\nattr = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE REF TO lcl.\nx = NEW #( ).\nDATA(a) = x.\na->attr = 1.\na->attr = 2."), cnt: 1, fix: true},
  {abap: local("DATA(a) = x.\nresult = a.\nattr = a.\nDATA(b) = a."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA t83 TYPE f.
    t83 = imp.
    DATA(t108) = t83.
    IF t108 > 10.
      result = 10.
    ELSEIF t108 < 0.
      result = 0.
    ELSE.
      result = trunc( t108 ).
    ENDIF.`), cnt: 1, fix: true},

  // one read is unnecessary_copy
  {abap: local("DATA(a) = x.\nresult = a."), cnt: 0},
  // a written or exposed
  {abap: local("DATA(a) = x.\na = 2.\nresult = a.\nattr = a."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nch( CHANGING c = a )."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nASSIGN a TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nDATA(r) = REF #( a )."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nPERFORM frm USING a."), cnt: 0},
  {abap: inMethod("DATA t TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA(a) = t.\nLOOP AT a ASSIGNING FIELD-SYMBOL(<r>).\n  <r> = 1.\nENDLOOP.\nresult = lines( a )."), cnt: 0},
  // b written after the declaration, or exposed
  {abap: local("DATA(a) = x.\nresult = a.\nx = 2.\nattr = a."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nattr = a.\nx = 2."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nch( CHANGING c = x ).\nattr = a."), cnt: 0},
  {abap: local("GET REFERENCE OF x INTO DATA(r).\nDATA(a) = x.\nresult = a.\nattr = a."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nattr = a.\nASSIGN x TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  // b not a local
  {abap: inMethod("DATA(a) = attr.\nresult = a.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = imp.\nresult = a.\nattr = a."), cnt: 0},
  {abap: inMethod("DATA(a) = ref->attr.\nresult = a.\nattr = a."), cnt: 0},
  // declaration not executed before every read
  {abap: local("IF imp = 1.\n  DATA(a) = x.\nENDIF.\nresult = a.\nattr = a."), cnt: 0},
  {abap: local("DO 2 TIMES.\n  x = sy-index.\n  DATA(a) = x.\nENDDO.\nresult = a.\nattr = a."), cnt: 0},
  // constant in a condition
  {abap: inMethod("DATA(a) = abap_true.\nIF a = abap_true.\nENDIF.\nIF a = abap_false.\nENDIF."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: local("DATA(a) = x.\nresult = a.\nattr = a.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _copy.\n  result = &1.\nEND-OF-DEFINITION.\n" + local("DATA(a) = x.\nresult = a.\n_copy a."), cnt: 0},
  {abap: local("DATA(a) = x.\nresult = a.\nattr = a.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, AliasNeverReassigned);
testSyntaxAfterFix(tests, AliasNeverReassigned);

testRuleFix([
  {
    input: inMethod(`    DATA x TYPE REF TO lcl.
    DATA(a) = x.
    a->put( ).
    result = a->get( ).`),
    output: inMethod(`    DATA x TYPE REF TO lcl.
    x->put( ).
    result = x->get( ).`),
  },
], AliasNeverReassigned);

testVersions(local("DATA(a) = x.\nresult = a.\nattr = a."), AliasNeverReassigned, [
  {version: Version.v740sp02, cnt: 1},
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
