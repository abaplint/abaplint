import {RedundantConversion} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "parser error.", cnt: 0},
  {abap: `DATA source TYPE string.
DATA target TYPE string.
target = CONV string( source ).`, cnt: 1},
  {abap: `DATA source TYPE string.
DATA target TYPE string.
target = CONV #( source ).`, cnt: 1},
  {abap: `DATA source TYPE i.
DATA target TYPE string.
target = CONV string( source ).`, cnt: 1}, // the target already has the type, see assignmentTarget below
  {abap: `TYPES ty_text TYPE c LENGTH 10.
DATA source TYPE ty_text.
DATA target TYPE ty_text.
target = CONV ty_text( source ).`, cnt: 1},
  {abap: `TYPES ty_text TYPE c LENGTH 10.
TYPES ty_other TYPE c LENGTH 10.
DATA source TYPE ty_text.
DATA target TYPE ty_other.
target = CONV ty_other( source ).`, cnt: 1},
  {abap: `DATA source TYPE i.
DATA target TYPE i.
target = CONV i( source + 1 ).`, cnt: 1},
  {abap: `DATA integer TYPE i.
DATA packed TYPE p LENGTH 8 DECIMALS 2.
DATA target TYPE i.
target = CONV i( integer + packed ).`, cnt: 1},
  {abap: `DATA integer TYPE i.
DATA packed TYPE p LENGTH 8 DECIMALS 2.
DATA target TYPE p LENGTH 8 DECIMALS 2.
target = CONV i( integer + packed ).`, cnt: 0},
  {abap: `TYPES: BEGIN OF ty_structure,
         component TYPE string,
       END OF ty_structure.
DATA source TYPE ty_structure.
DATA target TYPE string.
target = CONV string( source-component ).`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING value TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
DATA source TYPE string.
lcl=>run( CONV #( source ) ).`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING value TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
DATA source TYPE i.
lcl=>run( CONV #( source ) ).`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING value TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
DATA source TYPE string.
lcl=>run( value = CONV string( source ) ).`, cnt: 1},
  {abap: `DATA source TYPE string.
DATA target TYPE string.
target = source.`, cnt: 0},  // built-in functions, as measured on a 7.58 system ("Redundant conversion for type STRING / I")
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV string( to_upper( iv ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV string( to_upper( iv_c ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV string( condense( iv ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV string( substring( val = iv off = 1 ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV string( replace( val = iv sub = \`a\` with = \`b\` ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV string( boolc( iv IS INITIAL ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV abap_bool( xsdbool( iv IS INITIAL ) ).`, cnt: 0},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV i( strlen( iv ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV i( lines( lt_s ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV i( find( val = iv sub = \`a\` ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV i( numofchar( iv ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = CONV i( abs( lv_p ) ).`, cnt: 0},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = condense( CONV string( iv ) ).`, cnt: 1},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = condense( CONV string( iv_c ) ).`, cnt: 0},
  {abap: `DATA iv TYPE string.
DATA iv_c TYPE c LENGTH 10.
DATA lt_s TYPE string_table.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
DATA(r) = to_upper( CONV string( iv ) ).`, cnt: 1},
  {abap: `TYPES: BEGIN OF ty,
         name TYPE string,
       END OF ty.
DATA lt TYPE STANDARD TABLE OF ty WITH EMPTY KEY.
LOOP AT lt INTO DATA(ls).
  DATA(r) = condense( CONV string( ls-name ) ).
ENDLOOP.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS to_upper IMPORTING val TYPE string RETURNING VALUE(result) TYPE string.
    CLASS-METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD to_upper.
  ENDMETHOD.
  METHOD run.
    DATA(r) = CONV string( to_upper( \`a\` ) ).
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
  {abap: `DATA(t2) = CONV string( |hello world| ).`, cnt: 1},
  {abap: `DATA(t5) = CONV i( strlen( |sdf| ) ).`, cnt: 1},
  {abap: `DATA t30 TYPE f.
DATA(t31) = CONV f( t30 / 2 ).`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty1 TYPE c LENGTH 20.
    TYPES ty2 TYPE c LENGTH 20.
    METHODS bar IMPORTING moo TYPE ty1.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    DATA val TYPE ty2.
    bar( CONV ty1( val ) ).
  ENDMETHOD.
ENDCLASS.`, cnt: 1},
  {abap: `TYPES tabname TYPE c LENGTH 30.
DATA iv_tablename TYPE c LENGTH 30.
DATA iv_objectname TYPE c LENGTH 30.
DATA(lv_tab) = COND tabname(
  WHEN iv_tablename IS NOT INITIAL THEN iv_tablename
  ELSE CONV tabname( iv_objectname ) ).`, cnt: 1},
  {abap: `DATA(lv) = CONV string( TEXT-dev ).`, cnt: 0}, // "DATA(lv) = TEXT-dev." does not compile
];

testRule(tests, RedundantConversion);

// option assignmentTarget: the CONV is the whole right-hand side of an assignment whose target has its type
const assignmentTarget = [
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i = CONV i( lv_s ).`, cnt: 1},
  {abap: `DATA lv_c TYPE c LENGTH 10.
DATA lv_s TYPE string.
lv_s = CONV string( lv_c ).`, cnt: 1},
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i = CONV #( lv_s ).`, cnt: 1},
  {abap: `DATA lv_i TYPE i.
lv_i = CONV i( '12' ).`, cnt: 1},
  {abap: `TYPES ty_p TYPE p LENGTH 8 DECIMALS 2.
DATA lv_s TYPE string.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
lv_p = CONV ty_p( lv_s ).`, cnt: 1},
  {abap: `TYPES: BEGIN OF ty,
         comp TYPE i,
       END OF ty.
DATA ls TYPE ty.
DATA lv_s TYPE string.
ls-comp = CONV i( lv_s ).`, cnt: 1},
  {abap: `DATA lv_s TYPE string.
FIELD-SYMBOLS <fs> TYPE i.
<fs> = CONV i( lv_s ).`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA mv_i TYPE i.
    CLASS-DATA gv_i TYPE i.
    CLASS-METHODS get RETURNING VALUE(result) TYPE string.
    METHODS run.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
  METHOD run.
    mv_i = CONV i( get( ) ).
    me->mv_i = CONV i( get( ) ).
    lcl=>gv_i = CONV i( get( ) ).
  ENDMETHOD.
ENDCLASS.`, cnt: 3},
  {abap: `DATA rv_value TYPE i.
DATA mv_seed TYPE i.
DATA iv_limit TYPE i.
rv_value = CONV i( mv_seed MOD iv_limit ).`, cnt: 1},
// not reported
  {abap: `DATA lv_s TYPE string.
DATA(lv_i) = CONV i( lv_s ).`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lv_i8 TYPE int8.
lv_i8 = CONV i( lv_s ).`, cnt: 0},
  {abap: `DATA lv_i TYPE i.
DATA lv_c TYPE c LENGTH 10.
lv_c = CONV string( lv_i ).`, cnt: 0},
  {abap: `TYPES ty_p3 TYPE p LENGTH 8 DECIMALS 3.
DATA lv_s TYPE string.
DATA lv_p TYPE p LENGTH 8 DECIMALS 2.
lv_p = CONV ty_p3( lv_s ).`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
IF CONV i( lv_s ) = lv_i.
ENDIF.`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
DATA(lv_b) = xsdbool( CONV i( lv_s ) > lv_i ).`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i = CONV i( lv_s ) + 1.`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i += CONV i( lv_s ).`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
DATA lv_j TYPE i.
lv_i = lv_j = CONV i( lv_s ).`, cnt: 0},
  {abap: `DATA lv_c TYPE c LENGTH 10.
DATA lv_s TYPE string.
lv_s = |{ CONV string( lv_c ) }|.`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING value TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
DATA lv_s TYPE string.
lcl=>run( CONV i( lv_s ) ).`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING url TYPE clike.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA lv_url TYPE string.
    lv_url = CONV string( url ).
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING ref TYPE REF TO data.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
    DATA lv_i TYPE i.
    lv_i = CONV i( ref->* ).
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
  {abap: `DATA lv_i TYPE i.
FIELD-SYMBOLS <any> TYPE any.
lv_i = CONV i( <any> ).`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i = CONV i( LET x = lv_s IN x ).`, cnt: 0},
  {abap: `TYPES: BEGIN OF ENUM ty_enum,
         first,
         second,
       END OF ENUM ty_enum.
DATA lv_enum TYPE ty_enum.
lv_enum = CONV ty_enum( 1 ).`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA lr_i TYPE REF TO i.
lr_i->* = CONV i( lv_s ).`, cnt: 0},
  {abap: `DATA lv_s TYPE string.
DATA ls_void TYPE bapiret2.
ls_void-message = CONV i( lv_s ).`, cnt: 0},
  {abap: `DATA lv_open_url TYPE string.
lv_open_url = CONV string( TEXT-dev ).`, cnt: 1}, // the assignment converts the text symbol by itself
];

testRule(assignmentTarget, RedundantConversion, undefined, "redundant_conversion, assignmentTarget");

const assignmentTargetOff = [
  {abap: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i = CONV i( lv_s ).`, cnt: 0},
  {abap: `DATA source TYPE i.
DATA target TYPE string.
target = CONV string( source ).`, cnt: 0},
  {abap: `DATA source TYPE string.
DATA target TYPE string.
target = CONV string( source ).`, cnt: 1},
];

testRule(assignmentTargetOff, RedundantConversion, {assignmentTarget: false}, "redundant_conversion, assignmentTarget off");

const fixes = [
  {input: `DATA source TYPE string.
DATA target TYPE string.
target = CONV string( source ).`, output: `DATA source TYPE string.
DATA target TYPE string.
target = source.`},
  {input: `DATA source TYPE i.
DATA target TYPE i.
target = CONV i( source + 1 ) * 2.`, output: `DATA source TYPE i.
DATA target TYPE i.
target = (source + 1) * 2.`},
  {input: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING value TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
DATA source TYPE string.
lcl=>run( CONV #( source ) ).`, output: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING value TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
DATA source TYPE string.
lcl=>run( source ).`},
  {input: `DATA iv TYPE string.
DATA(r) = CONV string( to_upper( iv ) ).`, output: `DATA iv TYPE string.
DATA(r) = to_upper( iv ).`},
  {input: `DATA iv TYPE string.
DATA(r) = condense( CONV string( iv ) ).`, output: `DATA iv TYPE string.
DATA(r) = condense( iv ).`},
  {input: `DATA(t2) = CONV string( |hello world| ).`, output: `DATA(t2) = |hello world|.`},
  {input: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i = CONV i( lv_s ).`, output: `DATA lv_s TYPE string.
DATA lv_i TYPE i.
lv_i = lv_s.`},
  {input: `DATA rv_value TYPE i.
DATA mv_seed TYPE i.
DATA iv_limit TYPE i.
rv_value = CONV i( mv_seed MOD iv_limit ).`, output: `DATA rv_value TYPE i.
DATA mv_seed TYPE i.
DATA iv_limit TYPE i.
rv_value = mv_seed MOD iv_limit.`},
  {input: `DATA source TYPE i.
DATA target TYPE i.
target = 2 * CONV i( source + 1 ).`, output: `DATA source TYPE i.
DATA target TYPE i.
target = 2 * (source + 1).`},
];

testRuleFix(fixes, RedundantConversion);
