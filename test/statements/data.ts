import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

  let tests = [
    "DATA lv_foo TYPE i.",
    "DATA lv_foo LIKE LINE OF foo.",
    "DATA lv_foo LIKE lv_foo.",
    "DATA lv_foo TYPE REF TO cl_foobar.",
    "DATA lv_foo TYPE TABLE OF i.",
    "DATA lv_foo TYPE zcl_class=>typedef.",
    "DATA lv_foo LIKE sy-tabix.",
    "data foo type ref to ZCL_FOOBAR.",
    "data foo type ref to ZCL_FOOBAR .",
    "DATA sdf TYPE c ##NEEDED.",
    "Data foo(89) type c.",
    "data foo type char100.",
    "data foo100 type c length 100.",
    "data char.",
    "data char(100).",
    "data sdf type table of ref to zcl_foobar.",
    "data range type range of string.",
    "data: lt_foo type table of bar initial size 0.",
    "data foobar type abap_bool read-only value ABAP_FALSE ##NO_TEXT.",
    "data item(4) value '  # '.",
    "CLASS-DATA gv_out TYPE xstring.",
    "DATA: mt_stage TYPE SORTED TABLE OF ty_stage WITH UNIQUE KEY file-path file-filename.",
    ];

statementType(tests, "DATA", Statements.Data);