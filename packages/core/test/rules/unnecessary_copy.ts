import {Version} from "../../src";
import {UnnecessaryCopy} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const tests: IRedundantTest[] = [
  // attribute, parameter, local, constant and me as the copied data object
  {abap: inMethod("DATA(a) = attr.\nresult = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = imp.\nresult = a + 1."), cnt: 1, fix: true},
  {abap: inMethod("DATA x TYPE i.\nx = imp.\nDATA(a) = x.\nattr = 5.\nput( ).\nresult = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = abap_true.\nDATA(o) = NEW lcl( ).\no->lif~flag = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = me.\na->put( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = lcl=>co.\nput( ).\nresult = a."), cnt: 1, fix: true},
  // a constant in a condition is left for constant_condition
  {abap: inMethod("DATA(a) = abap_true.\nIF a = abap_true.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nIF a = 1.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = sy-tabix.\nresult = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = sy-tabix.\nput( ).\nresult = a."), cnt: 0},
  // the receiver is evaluated before the call and its arguments
  {abap: inMethod("DATA(a) = ref.\na->put( p = get( ) )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = me->ref.\nresult = a->get( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = ref.\nresult = get( ) + a->get( )."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nx = 1.\nDATA(a) = x.\nput( p = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = attr.\nput( p = a )."), cnt: 0},
  // nested block, loop, string template, component
  {abap: inMethod("DATA(a) = attr.\nIF imp = 1.\n  result = a.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DO 2 TIMES.\n  DATA(a) = attr.\n  result = a.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = text.\ntext = |{ a }!|."), cnt: 1, fix: true},
  {abap: inMethod("TYPES: BEGIN OF ty,\n  c TYPE i,\nEND OF ty.\nDATA s TYPE ty.\nDATA(a) = s-c.\nresult = a."), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA(t1) = iref.
    DATA t6 TYPE REF TO lcl.
    DATA(t7) = t1.
    t6 = t7.
    result = t1->get( ) + t6->get( ).`), cnt: 1, fix: true},
  {abap: inMethod(`    DATA(t40) = abap_true.
    DATA(t41) = NEW lcl( ).
    t41->put( ).
    t41->lif~flag = t40.`), cnt: 1, fix: true},

  // more than one reference of a
  {abap: inMethod("DATA(a) = attr.\nresult = a.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\na = 2.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nCLEAR a."), cnt: 0},
  // write in between
  {abap: inMethod("DATA x TYPE i.\nDATA(a) = x.\nx = 2.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nattr = 2.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nme->attr = 2.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = ref->attr.\nDATA(o) = ref.\no->attr = 2.\nresult = a.\nresult = o->attr."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nput( ).\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nDATA(o) = NEW lcl( ).\nresult = a."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nDATA(a) = x.\nch( CHANGING c = x ).\nresult = a."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nDATA(a) = x.\nx = get( p = a )."), cnt: 0},
  // CHANGING, REF, ASSIGN, USING of a
  {abap: inMethod("DATA(a) = attr.\nch( CHANGING c = a )."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nDATA(r) = REF #( a )."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nGET REFERENCE OF a INTO DATA(r)."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nASSIGN a TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nPERFORM frm USING a."), cnt: 0},
  // address of b taken, field symbol writes
  {abap: inMethod("DATA x TYPE i.\nGET REFERENCE OF x INTO DATA(r).\nDATA(a) = x.\nresult = a."), cnt: 0},
  {abap: inMethod("ASSIGN attr TO FIELD-SYMBOL(<fs>).\nDATA(a) = attr.\n<fs> = 2.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA x TYPE i.\nDATA(a) = x.\nASSIGN x TO FIELD-SYMBOL(<fs>).\n<fs> = 2.\nresult = a."), cnt: 0},
  // declaration does not dominate the read, or another loop
  {abap: inMethod("IF imp = 1.\n  DATA(a) = attr.\nENDIF.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nDO 2 TIMES.\n  result = a.\nENDDO."), cnt: 0},
  {abap: inMethod("TRY.\n    DATA(a) = attr.\n  CATCH cx_root.\n    result = a.\nENDTRY."), cnt: 0},
  // not a plain data object
  {abap: inMethod("ASSIGN attr TO FIELD-SYMBOL(<fs>).\nDATA(a) = <fs>.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = tab[ 1 ].\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = text+1(2).\ntext = a."), cnt: 0},
  {abap: inMethod("DATA(a) = 5.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA dref TYPE REF TO i.\nDATA(a) = dref->*.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA a TYPE i.\na = attr.\nresult = a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr ##NEEDED.\nresult = a."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: inMethod("DATA(a) = attr.\nresult = a.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>)."), cnt: 0},
  {abap: "DEFINE _copy.\n  result = &1.\nEND-OF-DEFINITION.\n" + inMethod("DATA(a) = attr.\n_copy a."), cnt: 0},
  {abap: inMethod("DATA(a) = attr.\nresult = a.\nunknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, UnnecessaryCopy);
testSyntaxAfterFix(tests, UnnecessaryCopy);

testRuleFix([
  {input: inMethod("    DATA(a) = attr.\n    result = a."), output: inMethod("    result = attr.")},
  {input: inMethod("    DATA(a) = attr. result = a."), output: inMethod("     result = attr.")},
  {input: inMethod("    DATA(A) = attr.\n    result = a."), output: inMethod("    result = attr.")},
  {input: inMethod("    DATA(a) = me->ref.\n    result = a->get( )."), output: inMethod("    result = me->ref->get( ).")},
  {input: inMethod("    DATA(a) = text.\n    text = |{ a }!|."), output: inMethod("    text = |{ text }!|.")},
  {input: inMethod("    DATA(a) = attr.\n    IF imp = 1.\n      result = a.\n    ENDIF."),
    output: inMethod("    IF imp = 1.\n      result = attr.\n    ENDIF.")},
], UnnecessaryCopy);

testVersions(inMethod("DATA(a) = attr.\nresult = a."), UnnecessaryCopy, [
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.v740sp02, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
