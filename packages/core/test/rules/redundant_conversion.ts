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
target = CONV string( source ).`, cnt: 0},
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
];

testRule(tests, RedundantConversion);

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
];

testRuleFix(fixes, RedundantConversion);
