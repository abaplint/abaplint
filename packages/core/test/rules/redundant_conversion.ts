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
target = source.`, cnt: 0},
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
];

testRuleFix(fixes, RedundantConversion);
