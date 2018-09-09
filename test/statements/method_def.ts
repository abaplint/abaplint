import {statementType, statementVersion} from "../utils";
import * as Statements from "../../src/statements/";
import {Version} from "../../src/version";

let tests = [
  "CLASS-METHODS status IMPORTING io_repo TYPE REF TO lcl_repo.",
  "CLASS-METHODS get_message RETURNING VALUE(rv_message) TYPE string RAISING lcx_exception.",
  "CLASS-METHODS expo IMPORTING io_rep TYPE REF TO lcl_repo it_fil TYPE scts_tadir OPTIONAL.",
  "methods read IMPORTING iv_name TYPE clike CHANGING  cg_data TYPE any RAISING lcx_exception.",
  "methods show IMPORTING iv_key            TYPE string VALUE(iv_current) TYPE i.",
  "CLASS-METHODS export IMPORTING iv_zip    TYPE abap_bool DEFAULT abap_true.",
  "METHODS convert_int FOR TESTING RAISING lcx_exception.",
  "METHODS refresh REDEFINITION.",
  "methods foobaaar final.",
  "methods BIND_ALV_OLE2 exceptions MISS_GUIDE.",
  "METHODS on_event FOR EVENT sapevent OF cl_gui_html_viewer.",
  "methods ADAPT_PARAMETERS final redefinition .",
  "METHODS on_event FOR EVENT sapevent OF cl_gui_html_viewer IMPORTING action frame.",
  "METHODS methodblah IMPORTING is_clskey TYPE sdf RAISING lcx_foo cx_bar.",
  "METHODS add IMPORTING foo TYPE string OPTIONAL.",
  "METHODS add IMPORTING foo TYPE string OPTIONAL bar TYPE string OPTIONAL.",
  "CLASS-METHODS handler FOR EVENT message OF cl_ci_test_root IMPORTING !p_checksum_1.",
  "methods CONVERT changing !CO_sdf type ref to ZCL_sdf optional.",
  "methods ADD_NEW importing !IP_TYPE type zasdf default zc_bar=>foo.",
  "methods read abstract importing i_filename type csequence.",
  "methods add_abap IMPORTING it_abap  TYPE STANDARD TABLE.",
  "CLASS-METHODS user IMPORTING iv_user TYPE xubname DEFAULT sy-uname.",
  "methods find_dot_abapgit RAISING lcx_exception.",
  "METHODS add_entity EXPORTING VALUE(foobar) TYPE i.",
  "METHODS get_count IMPORTING iv_index TYPE i RETURNING VALUE(rv_value) TYPE i.",
  "methods CONSTRUCTOR importing foobar type ref to /IWBEP/IF_MGW_CONV_SRV_RUNTIME raising /IWBEP/CX_MGW_TECH_EXCEPTION .",
  "methods ADD importing OBJ type ANY optional CONTEXT type SIMPLE optional preferred parameter OBJ.",
  "METHODS check_input RAISING resumable(zcx_exception).",
  "class-methods SET_CELL_VALUE_IN_EXCEL changing value(CV_CELL_WIDTH) type I optional.",
  "methods foo importing it_foo type INDEX TABLE.",
  "class-methods get importing bar like lcl_cla=>field.",
  "METHODS method1 DEFAULT FAIL.",
  "METHODS foo IMPORTING inp TYPE LINE OF bar.",
  "METHODS method2 DEFAULT IGNORE.",
  "methods CONSTRUCTOR\n" +
  "  importing\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional\n" +
  "    foo type index table optional.",
  "METHODS format_message importing id like sy-msgid.",
  "METHODS format_message importing id like sy-msgid default sy-msgid.",
  "METHODS format_message importing lang type langu default '-'.",
];

statementType(tests, "METHODS", Statements.MethodDef);


let versions = [
  {abap: "METHODS method2 DEFAULT IGNORE.", ver: Version.v740sp08},
];

statementVersion(versions, "METHODS", Statements.MethodDef);