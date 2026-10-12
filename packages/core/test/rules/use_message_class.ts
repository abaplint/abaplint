import {testRule} from "./_utils";
import {UseMessageClass, UseMessageClassConf} from "../../src/rules";

const tests = [
  // ok: structured form with class in parens
  {abap: `MESSAGE e001(bc_msg).`, cnt: 0},
  // ok: ID/TYPE/NUMBER form
  {abap: `MESSAGE ID 'BC_MSG' TYPE 'E' NUMBER '001'.`, cnt: 0},
  // ok: parser error
  {abap: `parser error`, cnt: 0},
  // bad: inline literal text
  {abap: `MESSAGE 'Something went wrong' TYPE 'E'.`, cnt: 1},
  // bad: backtick literal
  {abap: "MESSAGE `Something went wrong` TYPE 'E'.", cnt: 1},
  // bad: variable as message text (not a SE91 class reference)
  {abap: `MESSAGE lv_text TYPE 'E'.`, cnt: 1},
  {abap: `DATA lv_text TYPE string.
MESSAGE lv_text TYPE 'E'.`, cnt: 1},
  // bad: text element (TEXT-t01) as message text
  {abap: `MESSAGE TEXT-t01 TYPE 'E'.`, cnt: 1},
  // ok: variable in structured message (not flagged — no literal)
  {abap: `MESSAGE e001(bc_msg) WITH lv_text.`, cnt: 0},
  // ok: exception object
  {abap: `DATA lx_error TYPE REF TO cx_root.
MESSAGE lx_error TYPE 'E'.`, cnt: 0},
  {abap: `TRY.
  CATCH cx_root INTO DATA(lx_error).
    MESSAGE lx_error TYPE 'E'.
ENDTRY.`, cnt: 0},
  {abap: `CLASS lcl_message DEFINITION.
  PUBLIC SECTION.
    DATA mx_error TYPE REF TO cx_root.
    CLASS-DATA gx_error TYPE REF TO cx_root.
ENDCLASS.
CLASS lcl_message IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  DATA lo_message TYPE REF TO lcl_message.
  MESSAGE lo_message TYPE 'E'.
  MESSAGE lo_message->mx_error TYPE 'E'.
  MESSAGE lcl_message=>gx_error TYPE 'E'.`, cnt: 0},
  {abap: `DATA lo_object TYPE REF TO object.
MESSAGE lo_object TYPE 'E'.`, cnt: 0},
  {abap: `TYPES: BEGIN OF ty_struc,
         error TYPE REF TO cx_root,
       END OF ty_struc.
DATA ls_struc TYPE ty_struc.
MESSAGE ls_struc-error TYPE 'E'.`, cnt: 0},
  // bad: void type, not an exception
  {abap: `DATA lv_text TYPE bapi_msg.
MESSAGE lv_text TYPE 'E'.`, cnt: 1},
  // bad: string in structure
  {abap: `TYPES: BEGIN OF ty_struc,
         text TYPE string,
       END OF ty_struc.
DATA ls_struc TYPE ty_struc.
MESSAGE ls_struc-text TYPE 'E'.`, cnt: 1},
];

testRule(tests, UseMessageClass);

const notAllowed = [
  {abap: `DATA lx_error TYPE REF TO cx_root.
MESSAGE lx_error TYPE 'E'.`, cnt: 1},
  {abap: `MESSAGE e001(bc_msg).`, cnt: 0},
];

const config = new UseMessageClassConf();
config.allowExceptions = false;
testRule(notAllowed, UseMessageClass, config, "test use_message_class rule, exceptions not allowed");
