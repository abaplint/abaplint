import {RangeRowValues} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error.", cnt: 0},

  // the three rows of the incident: missing, lower case and unknown OPTION
  {abap: `TYPES ty_range TYPE RANGE OF string.
DATA lt_range TYPE ty_range.
lt_range = VALUE #( ( sign = 'I' low = \`X\` )
                    ( sign = 'I' option = 'eq' low = \`Y\` )
                    ( sign = 'I' option = 'ZZ' low = \`Z\` ) ).`, cnt: 3},
  {abap: `TYPES ty_range TYPE RANGE OF string.
DATA(lt_range) = VALUE ty_range( ( sign = 'I' option = \`eq\` low = \`a\` ) ).`, cnt: 1},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( ( sign = 'i' option = 'EQ' low = 1 ) ).`, cnt: 1},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( ( sign = 'X' option = 'EQ' low = 1 ) ).`, cnt: 1},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( ( option = 'EQ' low = 1 ) ).`, cnt: 1},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( ( low = 1 ) ).`, cnt: 2},
  {abap: `DATA lt_range TYPE RANGE OF i.
DATA lt_other LIKE lt_range.
lt_other = VALUE #( ( sign = 'I' low = 1 ) ).`, cnt: 1},
  {abap: `DATA lv_value TYPE i.
DATA lt_range LIKE RANGE OF lv_value.
lt_range = VALUE #( ( sign = 'I' low = 1 ) ).`, cnt: 1},

  // the target type inferred from a method parameter and from a component
  {abap: `TYPES ty_range TYPE RANGE OF i.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS run IMPORTING it_range TYPE ty_range.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.
START-OF-SELECTION.
  lcl=>run( VALUE #( ( sign = 'I' option = 'eq' low = 1 ) ) ).`, cnt: 1},
  {abap: `TYPES: BEGIN OF ty_filter,
         name  TYPE string,
         range TYPE RANGE OF i,
       END OF ty_filter.
DATA ls_filter TYPE ty_filter.
ls_filter = VALUE #( name = \`a\` range = VALUE #( ( sign = 'I' low = 1 ) ) ).`, cnt: 1},

  // a row structure with exactly sign, option, low and high
  {abap: `TYPES: BEGIN OF ty_row,
         sign   TYPE c LENGTH 1,
         option TYPE c LENGTH 2,
         low    TYPE string,
         high   TYPE string,
       END OF ty_row.
TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA lt_rows TYPE ty_rows.
lt_rows = VALUE #( ( sign = 'I' option = 'eq' low = \`a\` ) ).`, cnt: 1},
  {abap: `TYPES: BEGIN OF ty_row,
         sign   TYPE c LENGTH 1,
         option TYPE c LENGTH 2,
         low    TYPE string,
         high   TYPE string,
       END OF ty_row.
DATA ls_row TYPE ty_row.
ls_row = VALUE #( sign = 'X' option = 'EQ' low = \`a\` ).`, cnt: 1},

  // header defaults count, for the rows after them
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( sign = 'I' option = 'EQ' ( low = 1 ) ( low = 2 ) ).`, cnt: 0},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( sign = 'I' ( option = 'EQ' low = 1 ) ( option = 'BT' low = 1 high = 2 ) ).`, cnt: 0},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( sign = 'I' option = 'eq' ( low = 1 ) ).`, cnt: 1},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( ( sign = 'I' low = 1 ) option = 'EQ' ( sign = 'I' low = 2 ) ).`, cnt: 1},

  // correct rows
  {abap: `DATA lt_range TYPE RANGE OF string.
lt_range = VALUE #( ( sign = 'I' option = 'EQ' low = \`X\` )
                    ( sign = \`E\` option = \`BT\` low = \`1\` high = \`9\` )
                    ( sign = 'I' option = 'CP' low = \`A*\` ) ).`, cnt: 0},
  {abap: `DATA lt_range TYPE RANGE OF i.
DATA lt_other TYPE RANGE OF i.
lt_range = VALUE #( BASE lt_other ( sign = 'I' option = 'NE' low = 1 ) ).`, cnt: 0},
  {abap: `DATA lt_range TYPE RANGE OF i.
DATA lt_numbers TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
lt_range = VALUE #( FOR n IN lt_numbers ( sign = 'I' option = 'EQ' low = n ) ).`, cnt: 0},

  // values from variables, constants and expressions are not judged
  {abap: `DATA lt_range TYPE RANGE OF string.
DATA lv_option TYPE c LENGTH 2 VALUE 'eq'.
lt_range = VALUE #( ( sign = 'I' option = lv_option low = \`Y\` ) ).`, cnt: 0},
  {abap: `CONSTANTS lc_sign TYPE c LENGTH 1 VALUE 'x'.
DATA lt_range TYPE RANGE OF string.
lt_range = VALUE #( ( sign = lc_sign option = to_upper( 'eq' ) low = \`Y\` ) ).`, cnt: 0},

  // whole rows, LINES OF and empty bodies
  {abap: `DATA lt_range TYPE RANGE OF i.
DATA ls_range LIKE LINE OF lt_range.
lt_range = VALUE #( ( ls_range ) ( LINES OF lt_range ) ).`, cnt: 0},
  {abap: `DATA lt_range TYPE RANGE OF i.
lt_range = VALUE #( ).`, cnt: 0},
  {abap: `DATA lt_range TYPE RANGE OF i.
DATA ls_range LIKE LINE OF lt_range.
ls_range = VALUE #( BASE ls_range low = 2 ).`, cnt: 0},

  // not a range row
  {abap: `TYPES: BEGIN OF ty_row,
         name   TYPE string,
         option TYPE string,
         low    TYPE string,
       END OF ty_row.
TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA lt_rows TYPE ty_rows.
lt_rows = VALUE #( ( name = \`a\` option = \`eq\` low = \`A\` ) ).`, cnt: 0},
  {abap: `TYPES: BEGIN OF ty_row,
         sign   TYPE c LENGTH 1,
         option TYPE c LENGTH 2,
         low    TYPE string,
         high   TYPE string,
         extra  TYPE string,
       END OF ty_row.
TYPES ty_rows TYPE STANDARD TABLE OF ty_row WITH DEFAULT KEY.
DATA lt_rows TYPE ty_rows.
lt_rows = VALUE #( ( sign = 'x' option = 'eq' low = \`a\` ) ).`, cnt: 0},

  // RANGE OF a type outside the registry is still a range
  {abap: `DATA lt_range TYPE RANGE OF matnr.
lt_range = VALUE #( ( sign = 'x' option = 'eq' low = 1 ) ).`, cnt: 2},
  // type not known, silent
  {abap: `DATA lt_range TYPE rseloption.
lt_range = VALUE #( ( sign = 'x' option = 'eq' low = 1 ) ).`, cnt: 0},
  {abap: `DATA lt_range TYPE rseloption.
DATA(lt_copy) = VALUE #( lt_range ).`, cnt: 0},
];

testRule(tests, RangeRowValues);
