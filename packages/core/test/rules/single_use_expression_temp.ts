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
  // other read positions
  {abap: inMethod("DATA(a) = get( ).\nput( p = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nget( a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nput( EXPORTING p = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = str( ).\nCALL METHOD str EXPORTING s = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = str( ).\nref = NEW lcl( s = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = str( ).\nCREATE OBJECT ref EXPORTING s = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nAPPEND a TO tab."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nIF a = 1.\n  put( ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nIF a >= 1.\n  put( ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("IF val = 1.\nELSEIF val = 2.\n  DATA(a) = get( ).\n  IF a = 1.\n  ENDIF.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\ntext = xsdbool( a = 1 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = str( ).\ntext = |<{ a }>|."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = obj( ).\na->put( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = obj( ).\nattr = a->attr."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = NEW lcl( ).\na->put( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = xsdbool( val IS INITIAL ).\nIF a = abap_true.\nENDIF."), cnt: 1, fix: true},
  // not a supported read position
  {abap: inMethod("DATA(a) = obj( ).\nIF a IS BOUND.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nWHILE a = 1.\nENDWHILE."), cnt: 0},
  {abap: inMethod("DATA(a) = obj( ).\na->attr = 1."), cnt: 0},
  {abap: inMethod("DATA(a) = obj( ).\nCALL METHOD a->put."), cnt: 0},
  {abap: inMethod("DATA(a) = REF #( attr ).\nattr = a->*."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nch( CHANGING c = a )."), cnt: 0},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA t1 TYPE ty_tab.\nt1 = VALUE ty_tab( ( 1 ) ).\nAPPEND LINES OF t1 TO tab."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nIF a BETWEEN 1 AND 2.\nENDIF."), cnt: 0},
  // constants can be read anywhere after the declaration
  {abap: inMethod("DATA(a) = 1.\nput( ).\nAPPEND a TO tab."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = |key|.\nDATA(b) = 1.\nput( ).\nstr( s = a v = b )."), cnt: 2, fix: true},
  {abap: inMethod("DATA(a) = |key|.\nput( ).\nIF val = 1.\n  str( s = a ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = |key|.\nDO 2 TIMES.\n  str( s = a ).\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = CONV i( 30 ).\nput( ).\nput( p = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = CONV string( 'abc' ).\nput( ).\nstr( s = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = 1.\nstr( s = str( ) v = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = |key|.\nput( ).\nattr = COND #( WHEN val = 1 THEN strlen( a ) )."), cnt: 1, fix: true},
  {abap: inMethod("IF val = 1.\n  DATA(a) = |key|.\nENDIF.\nstr( s = a )."), cnt: 0},
  {abap: inMethod("DATA(a) = CONV i( '30' ).\nput( ).\nput( p = a )."), cnt: 0},
  // a character constant in a condition is left for constant_condition
  {abap: inMethod("DATA(a) = 'X'.\nput( ).\nIF a = abap_true.\nENDIF."), cnt: 0},
  // other expressions must be read in the next statement, as the first thing evaluated, and always
  {abap: inMethod("DATA(a) = get( ).\nput( ).\nput( p = a )."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nstr( s = str( ) v = a )."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nstr( s = text v = a )."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nobj( )->put( p = a )."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nref->put( p = a )."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nIF val = 1 AND a = 2.\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nattr = COND #( WHEN val = 1 THEN get( p = a ) )."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nIF val = 1.\n  put( p = a ).\nENDIF."), cnt: 0},
  {abap: inMethod("DATA(a) = get( ).\nme->put( p = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( ).\nDATA(o) = NEW lcl( ).\no->put( p = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA o TYPE REF TO lcl.\no = NEW #( ).\nDATA(a) = get( ).\no->put( p = a )."), cnt: 1, fix: true},
  // expressions that only read local variables can be anywhere in the next statement
  {abap: inMethod("DATA(a) = xsdbool( val IS INITIAL ).\nIF val = 1 AND a = abap_true.\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = |{ val }|.\nstr( v = get( ) s = a )."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = xsdbool( iref IS INITIAL ).\nIF val = 1 AND a = abap_true.\nENDIF."), cnt: 0},
  // plain data objects are left for unnecessary_copy
  {abap: inMethod("DATA(a) = attr.\nresult = a."), cnt: 0},
  // the expression reads the target: fine when the result is built in a temporary
  {abap: inMethod("DATA(a) = |{ text }!|.\ntext = a."), cnt: 1, fix: true},
  {abap: inMethod("DATA(a) = get( p = attr ).\nattr = a."), cnt: 1, fix: true},
  {abap: inMethod("ASSIGN attr TO FIELD-SYMBOL(<fs>).\nDATA(a) = get( ).\n<fs> = a."), cnt: 1, fix: true},
  // constructor expressions that can build the result in the target
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA(a) = VALUE ty_tab( ( 1 ) ).\ntab = a."), cnt: 0},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA t TYPE ty_tab.\nDATA(a) = VALUE ty_tab( ( LINES OF t ) ( 1 ) ).\nt = a.\ntab = t."), cnt: 0},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA t TYPE ty_tab.\nGET REFERENCE OF t INTO DATA(r).\nDATA(a) = VALUE ty_tab( ( 1 ) ).\nt = a.\ntab = t."), cnt: 0},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nASSIGN tab TO FIELD-SYMBOL(<t>).\nDATA(a) = VALUE ty_tab( ( 1 ) ).\n<t> = a."), cnt: 0},

  // DATA v TYPE t. v = <expression>.
  {abap: inMethod("DATA t2 TYPE string.\nt2 = |abapdoc|.\nref = NEW lcl( s = t2 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t2 TYPE string.\nCLEAR t2.\nt2 = |abapdoc|.\ntext = t2."), cnt: 1, fix: true},
  {abap: inMethod("DATA t9 TYPE REF TO lcl.\nt9 = ref->ref.\nattr = t9->get( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t23 TYPE REF TO lcl.\nt23 = me->ref.\nref = t23."), cnt: 1, fix: true},
  {abap: inMethod("DATA t5 TYPE abap_bool.\nt5 = xsdbool( val IS INITIAL ).\nIF t5 = abap_true.\n  put( ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nput( p = t1 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE string.\nt1 = str( ).\ntext = |a{ t1 }b|."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nAPPEND t1 TO tab."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE string.\nt1 = str( ).\nCREATE OBJECT ref EXPORTING s = t1."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE REF TO lcl.\nt1 = NEW lcl( ).\nt1->put( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE REF TO lcl.\nt1 = CAST lcl( iref ).\nt1->put( )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = lines( tab ).\nput( p = t1 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE string.\nt1 = 'abc' && text.\nstr( s = t1 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = 5.\nput( ).\nIF val = 1.\n  put( p = t1 ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = co.\nput( ).\nput( p = t1 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE string.\nt1 = str( ).\nCLEAR text.\ntext = t1."), cnt: 0},
  // DATA(v) = VALUE t( ). v = <expression>.
  {abap: inMethod("DATA(t29) = VALUE abap_bool( ).\nDATA t32 TYPE REF TO lcl.\nt29 = xsdbool( val IS INITIAL ).\nIF t29 = abap_true.\n  put( o = t32 ).\nENDIF."), cnt: 1, fix: true},
  {abap: inMethod("DATA(t1) = VALUE i( ).\nCLEAR t1.\nt1 = get( ).\nput( p = t1 )."), cnt: 1, fix: true},
  {abap: inMethod("DO 2 TIMES.\n  DATA(t1) = VALUE f( ).\n  t1 = t1 + 1.\n  DATA(t2) = VALUE f( ).\n  t2 = t1 + 1.\n  t1 = t2.\nENDDO."), cnt: 1, fix: true},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA(t1) = VALUE ty_tab( ).\nt1 = VALUE ty_tab( ( 1 ) ).\nDATA(t) = t1.\ntab = t."), cnt: 1, fix: true},
  {abap: inMethod("DATA(t1) = VALUE f( ).\nt1 = strlen( text ).\nDATA f2 TYPE f.\nf2 = t1.\nCLEAR f2."), cnt: 0},
  {abap: inMethod("DATA(t1) = VALUE string( ).\nt1 = str( ).\nt1 = str( ).\nstr( s = t1 )."), cnt: 0},
  // into y = v. also up casts and expressions typed by the target
  {abap: inMethod("DATA o TYPE REF TO object.\nDATA t1 TYPE REF TO lif.\nt1 = me->ref.\no = t1.\nput( o = CAST lcl( o ) )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE REF TO lcl.\nt1 = NEW #( ).\nref = t1."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = val + 1.\nattr = t1."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE string.\nt1 = CONV #( val ).\ntext = t1."), cnt: 1, fix: true},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA t1 TYPE ty_tab.\nt1 = VALUE ty_tab( ( 1 ) ).\nDATA(t) = t1.\ntab = t."), cnt: 1, fix: true},
  {abap: inMethod("TYPES ty_tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.\nDATA t TYPE ty_tab.\nDATA t1 TYPE ty_tab.\nt1 = VALUE #( ( 1 ) ).\nt = t1.\ntab = t."), cnt: 1, fix: true},
  // the type of the expression differs from the declared type
  {abap: inMethod("DATA t164 TYPE f.\nt164 = strlen( text ).\nDATA f2 TYPE f.\nf2 = t164.\nCLEAR f2."), cnt: 0},
  {abap: inMethod("DATA t164 TYPE f.\nt164 = strlen( text ).\ntext = |{ t164 }|."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE c LENGTH 10.\nt1 = str( ).\ntext = t1."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE string.\nt1 = 'abc'.\nstr( s = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE REF TO lcl.\nt1 = NEW lsub( ).\nt1->put( )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE REF TO lcl.\nt1 = NEW lsub( ).\nDATA(o) = t1.\nCLEAR o."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE REF TO lcl.\nt1 = NEW lsub( ).\nref = t1."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = val + 1.\nDATA f2 TYPE f.\nf2 = t1.\nCLEAR f2."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = val + 1.\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = val + 1.\nDATA(x) = t1.\nCLEAR x."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE string.\nt1 = CONV #( val ).\nstr( s = t1 )."), cnt: 0},
  // other references to v
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nput( p = t1 ).\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nt1 = get( ).\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = 1.\nCLEAR t1.\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = 1.\nGET REFERENCE OF t1 INTO DATA(r).\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i VALUE 2.\nt1 = get( ).\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA: t1 TYPE i,\n      t2 TYPE i.\nt1 = get( ).\nput( p = t1 ).\nCLEAR t2."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nt1 = t1 + 1.\nput( p = t1 )."), cnt: 0},
  // not the next statement, or not assigned on every path
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nput( ).\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nDATA t2 TYPE i.\nTYPES ty TYPE i.\nput( p = t1 ).\nCLEAR t2."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = get( ).\nIF val = 1.\n  put( p = t1 ).\nENDIF."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE string.\nIF val = 1.\n  t1 = |a|.\nENDIF.\ntext = t1."), cnt: 0},
  // a data object that other code can change keeps its value until the read
  {abap: inMethod("DATA t1 TYPE i.\nt1 = attr.\nput( p = t1 )."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = attr.\nstr( v = t1 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = attr.\nIF t1 = get( ).\nENDIF."), cnt: 0},
  {abap: inMethod("DATA t1 TYPE i.\nt1 = attr.\nIF t1 = 2.\nENDIF."), cnt: 1, fix: true},
  // local variables copied into y = v. are left for copy_chain
  {abap: inMethod("DATA l TYPE i.\nl = attr.\nput( ).\nDATA t1 TYPE i.\nt1 = l.\nattr = t1."), cnt: 0},
  {abap: inMethod("DATA l TYPE i.\nl = attr.\nput( ).\nDATA t1 TYPE i.\nt1 = l.\nput( p = t1 )."), cnt: 1, fix: true},
  {abap: inMethod("DATA l TYPE i.\nl = attr.\nDATA t1 TYPE i.\nt1 = l.\nattr = t1."), cnt: 1, fix: true},
  {abap: inMethod("DATA l TYPE i.\nGET REFERENCE OF l INTO DATA(r).\nput( ).\nDATA t1 TYPE i.\nt1 = l.\nput( p = t1 )."), cnt: 0},

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
  {
    input: inMethod(`    DATA t2 TYPE string.
    CLEAR t2.
    t2 = |abapdoc|.
    ref = NEW lcl( s = t2 ).`),
    output: inMethod(`    ref = NEW lcl( s = |abapdoc| ).`),
  },
  {
    input: inMethod(`    DATA t9 TYPE REF TO lcl.
    t9 = ref->ref.
    attr = t9->get( ).`),
    output: inMethod(`    attr = ref->ref->get( ).`),
  },
  {
    input: inMethod(`    DATA t5 TYPE abap_bool.
    t5 = xsdbool( val IS INITIAL ).
    IF t5 = abap_true.
      put( ).
    ENDIF.`),
    output: inMethod(`    IF xsdbool( val IS INITIAL ) = abap_true.
      put( ).
    ENDIF.`),
  },
  {
    input: inMethod(`    DATA(t21) = 1.
    put( ).
    APPEND t21 TO tab.`),
    output: inMethod(`    put( ).
    APPEND 1 TO tab.`),
  },
  {
    input: inMethod(`    DATA(t3) = CONV i( 30 ).
    put( p = t3 ).`),
    output: inMethod(`    put( p = CONV i( 30 ) ).`),
  },
  {
    input: inMethod(`    DATA t1 TYPE REF TO lcl.
    t1 = NEW #( ).
    ref = t1.`),
    output: inMethod(`    ref = NEW #( ).`),
  },
], SingleUseExpressionTemp);

testVersions(inMethod("DATA(a) = get( ).\nresult = a."), SingleUseExpressionTemp, [
  {version: Version.v740sp02, cnt: 1},
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);

// moving into other places than y = v. needs expressions in more operand positions
testVersions(inMethod("DATA t1 TYPE i.\nt1 = get( ).\nput( p = t1 ).\nDATA t2 TYPE i.\nt2 = get( ).\nattr = t2."), SingleUseExpressionTemp, [
  {version: Version.v702, cnt: 1},
  {version: Version.v740sp02, cnt: 2},
  {version: Version.OpenABAP, cnt: 2},
  {version: Version.Cloud, cnt: 2},
]);
