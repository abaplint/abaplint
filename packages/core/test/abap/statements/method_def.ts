import {statementExpectFail, statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
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
  "METHODS on_event ABSTRACT FOR EVENT sapevent OF cl_gui_html_viewer.",
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
  "CLASS-METHODS name IMPORTING REFERENCE(i_center) TYPE REF TO zcl_bar.",
  "METHODS blah IMPORTING is_blah LIKE LINE OF mt_blah.",
  "methods DESTRUCTOR NOT AT END OF MODE.",
  "methods name exporting !out type %_C_POINTER.",
  "METHODS run IMPORTING parameter TYPE zif_definitions~ty_type.",
  "CLASS-METHODS foo FOR TABLE FUNCTION bar.",
  "class-methods run importing it_list like gt_list[].",

  `METHODS get_uri_query_parameter
    IMPORTING
      name      TYPE string
      default   TYPE string OPTIONAL
      mandatory TYPE abap_bool
    EXPORTING
      value     TYPE string.`,
  "class-methods bar exceptions /space/cx_error.",
  "METHODS test1 ABSTRACT FOR TESTING RAISING cx_static_check.",
  `CLASS-METHODS connection_graph
    FOR DDL OBJECT
    OPTIONS CDS SESSION CLIENT REQUIRED.`,
  `CLASS-METHODS get_shortest_path AMDP OPTIONS CDS SESSION CLIENT current.`,
  `METHODS /ui2/bar.`,
  `METHODS /ui2/foo_bar RETURNING VALUE(ro_/ui2/moo) TYPE REF TO /ui2/boo.`,

  `METHODS validate_foo  FOR VALIDATE ON SAVE IMPORTING keys FOR foo~bar.`,
  `METHODS modify_foo    FOR MODIFY IMPORTING  keys FOR ACTION foo~bar RESULT result.`,
  `METHODS features_foo  FOR FEATURES IMPORTING keys REQUEST requested_features FOR bar RESULT result.`,
  `METHODS determine_foo FOR DETERMINE ON MODIFY IMPORTING keys FOR foo~bar.`,

  `CLASS-METHODS get_shortest_path
  AMDP OPTIONS CDS SESSION CLIENT current
  IMPORTING VALUE(i_airport_from) TYPE zabap_graph_spfli_edge-AirportFrom
            VALUE(i_airport_to)   TYPE zabap_graph_spfli_edge-AirportTo
  EXPORTING VALUE(e_routes)       TYPE tt_routes
  RAISING   cx_amdp_execution_error.`,

  `METHODS read FOR READ IMPORTING keys FOR READ /foo/bar RESULT result.`,
  `METHODS set_foo FOR DETERMINE ON SAVE IMPORTING keys FOR foo~set_foo.`,
  `METHODS create FOR MODIFY IMPORTING entities FOR CREATE item.`,
  `METHODS update FOR MODIFY IMPORTING entities FOR UPDATE header.`,
  `METHODS delete FOR MODIFY IMPORTING keys FOR DELETE links.`,
  `METHODS item FOR MODIFY IMPORTING enti FOR CREATE header\\_item.`,
];
statementType(tests, "METHODS", Statements.MethodDef);


const versions = [
  {abap: "METHODS method2 DEFAULT IGNORE.", ver: Version.v740sp08},
];
statementVersion(versions, "METHODS", Statements.MethodDef);

const fails = [
  "METHODS test1 FOR TESTING RETURNING VALUE(vbeln) TYPE string.",
];
statementExpectFail(fails, "MethodDef");