import {RedundantCast} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";

const tests = [
  {abap: "parser error.", cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA bar TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

FORM bar.
  DATA i_parsed TYPE REF TO object.
  DATA(t1) = CAST lcl( i_parsed ).
  WRITE / t1->bar.
  DATA(t2) = CAST lcl( t1 ).
  WRITE / t2->bar.
ENDFORM.

START-OF-SELECTION.
  PERFORM bar.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA bar TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

FORM bar.
  DATA i_parsed TYPE REF TO object.
  DATA(t1) = CAST lcl( i_parsed ).
  WRITE / t1->bar.
ENDFORM.`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA bar TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

FORM bar.
  DATA t1 TYPE REF TO lcl.
  WRITE / CAST lcl( t1 )->bar.
ENDFORM.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    DATA bar TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

FORM bar.
  DATA t1 TYPE REF TO lcl.
  DATA t2 TYPE REF TO lcl.
  t2 = CAST #( t1 ).
ENDFORM.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.
CLASS lcl_sub DEFINITION INHERITING FROM lcl.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
ENDCLASS.

FORM bar.
  DATA t1 TYPE REF TO lcl.
  DATA(t2) = CAST lcl_sub( t1 ).
ENDFORM.`, cnt: 0},
  {abap: `CLASS lcl DEFINITION.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

FORM bar.
  DATA i_parsed TYPE REF TO lcl.
  DATA(t1) = CAST lcl( i_parsed ).
ENDFORM.

START-OF-SELECTION.
  PERFORM bar.`, cnt: 1},
  {abap: `DATA t1 TYPE REF TO data.
DATA(t2) = CAST i( t1 ).`, cnt: 0},
];

testRule(tests, RedundantCast);

const fixes = [
  {input: `CLASS lcl DEFINITION.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.
DATA t1 TYPE REF TO lcl.
DATA(t2) = CAST lcl( t1 ).`, output: `CLASS lcl DEFINITION.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.
DATA t1 TYPE REF TO lcl.
DATA(t2) = t1.`},
];

testRuleFix(fixes, RedundantCast);
