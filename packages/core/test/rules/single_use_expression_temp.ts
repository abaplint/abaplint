import {Version} from "../../src";
import {SingleUseExpressionTemp} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const tests: IRedundantTest[] = [
  {abap: inMethod("DATA(a) = NEW lcl( ).\nref = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = |abc|.\ntext = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = 'abc'.\ntext = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = 5.\nresult = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nresult = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = |a| && `b` && 'c'.\ntext = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = xsdbool( imp = 1 ).\ntext = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = tab[ 1 ].\nresult = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = ref->obj( ).\nme->ref = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = CAST lcl( iref ).\nref = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nDATA(b) = a.\nresult = b."), cnt: 1, fix: true},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA t TYPE ty_tab.\nDATA(a) = VALUE ty_tab( ( 1 ) ).\nt = a.\ntab = t."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA(t1) = NEW lcl( ).
    me->ref = t1.
    DATA t2 TYPE string.
    DATA(t3) = |abapdoc|.
    t2 = t3.
    text = t2.`), cnt: 2, fix: true},

  // the result type depends on the target
  {abap: inMethod("DATA p TYPE p LENGTH 8 DECIMALS 2.\nDATA(a) = 1 / 3.\np = a.\nresult = p."), cnt: 0},
  {abap: inMethod("DATA(a) = imp + 1.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = - imp.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = get( p = imp + 1 ).\nresult = a."), cnt: 0},
  {abap: inMethod("DATA x TYPE x LENGTH 1.\nDATA(a) = BIT-NOT x.\nx = a."), cnt: 0},
  {abap: inMethod("DATA(a) = CONV string( imp ).\ntext = a."), cnt: 0},
  {abap: inMethod("DATA(a) = EXACT string( text ).\ntext = a."), cnt: 0},
  {abap: inMethod("DATA(a) = abs( imp ).\nresult = a."), cnt: 0},
  {abap: inMethod("DATA r TYPE REF TO data.\nDATA(a) = REF #( attr ).\nr = a."), cnt: 0},
  {abap: inMethod("DATA(a) = ( imp ).\nresult = a."), cnt: 0},
  // not directly followed by x = a.
  {abap: inMethod("DATA(a) = get( ).\nput( ).\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nresult = a.\nattr = a."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nresult = a + 1."), cnt: 0},
  {abap: inMethod("DATA s TYPE REF TO lsub.\nDATA(a) = obj( ).\ns ?= a."), cnt: 0},
  {abap: inMethod("IF imp = 1.\n  DATA(a) = get( ).\nENDIF.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nput( p = a )."), cnt: 0},
  // plain data objects are left for unnecessary_copy
  {abap: inMethod("DATA(a) = attr.\nresult = a."), cnt: 0},
  // the target is used by the expression
  {abap: inMethod("DATA(a) = |{ text }!|.\ntext = a."), cnt: 0},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA(a) = VALUE ty_tab( ( 1 ) ).\ntab = a."), cnt: 0},
  {abap: inMethod("ASSIGN attr TO FIELD-SYMBOL(<fs>).\nDATA(a) = get( ).\n<fs> = a."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA(a) = get( ).\nresult = a.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _copy.\n  result = &1.\nEND-OF-DEFINITION.\n" + inMethod("DATA(a) = get( ).\n_copy a."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nresult = a.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, SingleUseExpressionTemp);
testSyntaxAfterFix(tests, SingleUseExpressionTemp);

testRuleFix([
  {input: inMethod("    DATA(a) = NEW lcl( ).\n    ref = a."), output: inMethod("    ref = NEW lcl( ).")},
  {input: inMethod("    DATA(a) = get(\n      p = 1 ).\n    result = a."), output: inMethod("    result = get(\n      p = 1 ).")},
], SingleUseExpressionTemp);

testVersions(inMethod("DATA(a) = get( ).\nresult = a."), SingleUseExpressionTemp, [
  {version: Version.v740sp02, cnt: 1},
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
