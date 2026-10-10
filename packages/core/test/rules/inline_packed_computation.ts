import {InlinePackedComputation} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error.", cnt: 0},
  {abap: `TYPES ty_ms TYPE p LENGTH 8 DECIMALS 0.
DATA a TYPE ty_ms.
DATA b TYPE ty_ms.
DATA(margin) = a - b.`, cnt: 1, fix: false},
  {abap: `TYPES: BEGIN OF ty_order,
         requireddate TYPE p LENGTH 8 DECIMALS 0,
         shippeddate  TYPE p LENGTH 8 DECIMALS 0,
       END OF ty_order.
DATA order TYPE ty_order.
DATA(margin) = order-requireddate - order-shippeddate.`, cnt: 1},
  {abap: `DATA lv_total TYPE p LENGTH 16 DECIMALS 0.
DATA(lv_target) = lv_total * 95 / 100.`, cnt: 1},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(b) = a + 1.`, cnt: 1},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA i TYPE i.
DATA(b) = i DIV a.`, cnt: 1},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(b) = ( a + 1 ) MOD 7.`, cnt: 1},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA i TYPE int8.
DATA(b) = i * a.`, cnt: 1},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
FINAL(b) = a * 2.`, cnt: 1},
  {abap: `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES ty_amount TYPE p LENGTH 10 DECIMALS 2.
    CLASS-METHODS total RETURNING VALUE(rv) TYPE decfloat34.
    CLASS-METHODS amount RETURNING VALUE(rv) TYPE ty_amount.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD total.
  ENDMETHOD.
  METHOD amount.
    DATA(x) = lcl=>amount( ) * 2.
    DATA(y) = lcl=>total( ) * 2.
    DATA(z) = amount( ) - 1.
  ENDMETHOD.
ENDCLASS.`, cnt: 2},

  // not a computation, or not with calculation type p
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(b) = a.`, cnt: 0},
  {abap: `DATA a TYPE i.
DATA b TYPE i.
DATA(c) = a - b.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA f TYPE f.
DATA(c) = a * f.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA d TYPE decfloat34.
DATA(c) = a * d.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(c) = a ** 2.`, cnt: 0},
  {abap: `TYPES ty_ms TYPE p LENGTH 8 DECIMALS 0.
DATA a TYPE ty_ms.
DATA b TYPE ty_ms.
DATA(margin) = CONV ty_ms( a - b ).`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(c) = COND #( WHEN a > 1 THEN a ELSE a * 2 ).`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(c) = SWITCH #( a WHEN 1 THEN a ELSE a * 2 ).`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA c TYPE p LENGTH 8 DECIMALS 3.
c = a * 2.`, cnt: 0},

  // operands whose effect on the calculation type is not decided here
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(c) = a * '1.5'.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA s TYPE string.
DATA(c) = a + s.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA n TYPE n LENGTH 5.
DATA(c) = a + n.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA d TYPE d.
DATA(c) = d - a.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(c) = a * cl_void=>factor( ).`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA(c) = a * lines( VALUE string_table( ) ).`, cnt: 0},
  {abap: `FORM foo USING a TYPE p.
  DATA(c) = a * 2.
ENDFORM.`, cnt: 0},
  {abap: `DATA a TYPE p LENGTH 8 DECIMALS 3.
DATA v TYPE void_data_element.
DATA(c) = a * v.`, cnt: 0},
];

testRule(tests, InlinePackedComputation);
