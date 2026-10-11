import {ChangingSortedLine} from "../../src/rules/changing_sorted_line";
import {testRule} from "./_utils";

function build(body: string, kind = "SORTED TABLE OF ty_s_sum WITH UNIQUE KEY app"): string {
  return `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_s_sum,
             app TYPE c LENGTH 30,
             cnt TYPE i,
           END OF ty_s_sum.
    TYPES ty_t_sum TYPE ${kind}.
    CLASS-METHODS add CHANGING cs_sum TYPE ty_s_sum.
    CLASS-METHODS add_cnt CHANGING cv TYPE i.
    CLASS-METHODS show IMPORTING is_sum TYPE ty_s_sum.
    CLASS-METHODS run IMPORTING lv_app TYPE ty_s_sum-app.
    CLASS-DATA gt_sum TYPE ty_t_sum.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD add.
  ENDMETHOD.
  METHOD add_cnt.
  ENDMETHOD.
  METHOD show.
  ENDMETHOD.
  METHOD run.
    DATA lt_sum TYPE ty_t_sum.
${body}
  ENDMETHOD.
ENDCLASS.`;
}

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},

  // the defect, each way of assigning the field symbol to a whole line
  {abap: build(`    READ TABLE lt_sum WITH TABLE KEY app = lv_app ASSIGNING FIELD-SYMBOL(<sum>).
    IF sy-subrc <> 0.
      INSERT VALUE #( app = lv_app ) INTO TABLE lt_sum ASSIGNING <sum>.
    ENDIF.
    add( CHANGING cs_sum = <sum> ).`), cnt: 1},
  {abap: build(`    LOOP AT lt_sum ASSIGNING FIELD-SYMBOL(<sum>).
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`), cnt: 1},
  {abap: build(`    INSERT VALUE #( app = lv_app ) INTO TABLE lt_sum ASSIGNING FIELD-SYMBOL(<sum>).
    add( CHANGING cs_sum = <sum> ).`), cnt: 1},
  {abap: build(`    ASSIGN lt_sum[ app = lv_app ] TO FIELD-SYMBOL(<sum>).
    add( CHANGING cs_sum = <sum> ).`), cnt: 1},
  {abap: build(`    FIELD-SYMBOLS <sum> TYPE ty_s_sum.
    READ TABLE lt_sum INDEX 1 ASSIGNING <sum>.
    CALL METHOD add CHANGING cs_sum = <sum>.`), cnt: 1},
  {abap: build(`    LOOP AT gt_sum ASSIGNING FIELD-SYMBOL(<sum>).
      lcl=>add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`), cnt: 1},
  {abap: build(`    LOOP AT lt_sum ASSIGNING FIELD-SYMBOL(<sum>).
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`, "HASHED TABLE OF ty_s_sum WITH UNIQUE KEY app"), cnt: 1},
  {abap: build(`    LOOP AT lt_sum ASSIGNING FIELD-SYMBOL(<sum>).
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`, "SORTED TABLE OF ty_s_sum WITH NON-UNIQUE KEY app"), cnt: 1},

  // a non-key component
  {abap: build(`    READ TABLE lt_sum WITH TABLE KEY app = lv_app ASSIGNING FIELD-SYMBOL(<sum>).
    add_cnt( CHANGING cv = <sum>-cnt ).`), cnt: 0},

  // a standard table
  {abap: build(`    LOOP AT lt_sum ASSIGNING FIELD-SYMBOL(<sum>).
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`, "STANDARD TABLE OF ty_s_sum WITH DEFAULT KEY"), cnt: 0},
  {abap: build(`    LOOP AT lt_sum ASSIGNING FIELD-SYMBOL(<sum>).
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`, "STANDARD TABLE OF ty_s_sum WITH NON-UNIQUE KEY app"), cnt: 0},

  // a work area
  {abap: build(`    READ TABLE lt_sum WITH TABLE KEY app = lv_app INTO DATA(ls_sum).
    add( CHANGING cs_sum = ls_sum ).
    MODIFY TABLE lt_sum FROM ls_sum.`), cnt: 0},

  // an importing parameter of the callee
  {abap: build(`    LOOP AT lt_sum ASSIGNING FIELD-SYMBOL(<sum>).
      show( <sum> ).
      show( EXPORTING is_sum = <sum> ).
    ENDLOOP.`), cnt: 0},

  // a generic field symbol, and a table of unknown kind
  {abap: build(`    FIELD-SYMBOLS <sum> TYPE any.
    LOOP AT lt_sum ASSIGNING <sum>.
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`), cnt: 0},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS add CHANGING cs_sum TYPE any.
    CLASS-METHODS run IMPORTING it_sum TYPE ANY TABLE.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD add.
  ENDMETHOD.
  METHOD run.
    FIELD-SYMBOLS <sum> TYPE any.
    LOOP AT it_sum ASSIGNING <sum>.
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.`, cnt: 0},

  // assigned to something else before the call
  {abap: build(`    DATA ls_sum TYPE ty_s_sum.
    FIELD-SYMBOLS <sum> TYPE ty_s_sum.
    READ TABLE lt_sum INDEX 1 ASSIGNING <sum>.
    ASSIGN ls_sum TO <sum>.
    add( CHANGING cs_sum = <sum> ).`), cnt: 0},
  {abap: build(`    DATA ls_sum TYPE ty_s_sum.
    FIELD-SYMBOLS <sum> TYPE ty_s_sum.
    READ TABLE lt_sum INDEX 1 ASSIGNING <sum>.
    ASSIGN COMPONENT 1 OF STRUCTURE ls_sum TO <sum>.
    add( CHANGING cs_sum = <sum> ).`), cnt: 0},
  {abap: build(`    DATA lt_std TYPE STANDARD TABLE OF ty_s_sum WITH DEFAULT KEY.
    FIELD-SYMBOLS <sum> TYPE ty_s_sum.
    READ TABLE lt_sum INDEX 1 ASSIGNING <sum>.
    LOOP AT lt_std ASSIGNING <sum>.
      add( CHANGING cs_sum = <sum> ).
    ENDLOOP.`), cnt: 0},

  // not assigned in this method
  {abap: build(`    FIELD-SYMBOLS <sum> TYPE ty_s_sum.
    add( CHANGING cs_sum = <sum> ).`), cnt: 0},
];

testRule(tests, ChangingSortedLine);
