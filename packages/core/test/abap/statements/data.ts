import {statementExpectFail, statementType, statementVersionOk} from "../_utils";
import {Version, Release} from "../../../src/version";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DATA lv_foo TYPE i.",
  "DATA lv_foo LIKE LINE OF foo.",
  "DATA lv_foo LIKE lv_foo.",
  "DATA lv_foo TYPE REF TO cl_foobar.",
  "DATA lv_foo TYPE TABLE OF i.",
  "DATA lv_foo TYPE zcl_class=>typedef.",
  "DATA lv_foo LIKE sy-tabix.",
  "data foo type ref to ZCL_FOOBAR.",
  "data foo type ref to ZCL_FOOBAR .",
  "data lt_foo LIKE STANDARD TABLE OF ld_font_family.",
  "data lt_data type table of d020s with header line.",
  "DATA sdf TYPE c ##NEEDED.",
  "Data foo(89) type c.",
  "data foo type char100.",
  "data foo100 type c length 100.",
  "DATA lv_int TYPE c LENGTH c_length.",
  "data char.",
  "data char(100).",
  "data sdf type table of ref to zcl_foobar.",
  "data range type range of string.",
  "data lt_foo type table of bar initial size 0.",
  "DATA tab LIKE STANDARD TABLE OF int INITIAL SIZE 2.",
  "data foo    type  i value -1.",
  "data foobar type abap_bool read-only value ABAP_FALSE ##NO_TEXT.",
  "data item(4) value '  # '.",
  "DATA ls_field_cat_comp  LIKE LINE OF <ls_object_table>-field_catalog.",
  "DATA lt_ucomm TYPE TABLE OF sy-ucomm.",
  "DATA tab LIKE foobar OCCURS 0 WITH HEADER LINE.",
  "DATA tab LIKE foobar OCCURS 0.",
  "DATA tab TYPE foobar OCCURS 0 WITH HEADER LINE.",
  "DATA mt_stage TYPE SORTED TABLE OF ty_stage WITH UNIQUE KEY file-path file-filename.",
  "data foo like bar[].",
  "DATA lt_list TYPE ddictype WITH HEADER LINE.",
  "DATA ret TYPE TABLE OF bapiret2 WITH HEADER LINE.",
  "data mt_field TYPE TABLE OF ty_view_field " +
    "WITH NON-UNIQUE SORTED KEY view_fieldname COMPONENTS view_fieldname " +
    "WITH NON-UNIQUE SORTED KEY no_case COMPONENTS no_case.",
  "DATA %id TYPE flag.",
  "DATA /foo/bar TYPE /foo/bar.",
  "DATA lr_/foo/cx_bar TYPE REF TO /foo/bar.",
  "DATA li_data(200) TYPE c OCCURS 0 WITH HEADER LINE.",
  "DATA lr_range type range of type WITH HEADER LINE.",
  "data $field type c.",
  "data $fie$ld type c.",
  "data lt_foo type standard table of snodetext initial size 0 with header line.",
  "DATA ret TYPE TABLE OF foobar INITIAL SIZE 10 WITH HEADER LINE.",
  "data foo type p decimals 0 length 4.",
  "DATA foo1 TYPE c LENGTH 1 VALUE 'A' READ-ONLY.",
  "DATA foo2 TYPE c READ-ONLY LENGTH 1 VALUE 'A'.",
  "DATA foo3 TYPE c VALUE 'A' LENGTH 1 READ-ONLY.",
  "DATA foo4 LENGTH 1 VALUE 'A' READ-ONLY TYPE c.",
  "DATA foo5 READ-ONLY LENGTH 1 VALUE 'A' TYPE c.",
  "DATA foo6 VALUE 'A' LENGTH 1 READ-ONLY TYPE c.",
  "DATA foo7(1) VALUE 'A' READ-ONLY TYPE c.",
  "DATA foo8(1) TYPE c VALUE 'A' READ-ONLY.",
  "DATA foo9(1) READ-ONLY VALUE 'A' TYPE c.",
  "DATA foo10(1) TYPE c READ-ONLY VALUE 'A'.",
  "DATA foo11 TYPE p DECIMALS 2.",
  "DATA foo12 DECIMALS 2 TYPE p.",
  "DATA foo13 LENGTH 5 TYPE p DECIMALS 2.",
  "DATA foo14 DECIMALS 2 TYPE p LENGTH 5.",
  "DATA foo15 TYPE p DECIMALS 2 VALUE 1.",
  "DATA foo16 DECIMALS 2 TYPE p VALUE 1.",
  "DATA foo17 VALUE 1 LENGTH 5 TYPE p DECIMALS 2.",
  "DATA foo18 VALUE 1 DECIMALS 2 TYPE p LENGTH 5.",
  "DATA *foo.",
  "DATA bar*.",
  "DATA moo*boo.",
  "DATA gt_data TYPE REF TO something OCCURS 0 WITH HEADER LINE.",
  "DATA ls_foo TYPE t_/moo/boo.",
  "DATA ls_/moo/boo TYPE t_bar.",
  "DATA ls_/moo/boo TYPE t_/moo/boo.",
  "DATA ls_/moo/boo TYPE STANDARD TABLE OF t_/moo/boo.",
  "DATA foo TYPE c LENGTH '5'.",
  "DATA gt_tab TYPE HASHED TABLE OF f_cut->type WITH UNIQUE KEY name1 name2.",
  "DATA moo LIKE STANDARD TABLE OF bar WITH DEFAULT KEY WITH HEADER LINE.",
  "data foo-bar type string.", // yes, this works in SAP, only gives a warning, tested on 751
  "DATA foo- TYPE string.",
  "DATA foo-- TYPE string.",
  "DATA /sdfs/sdfsd-sdfsd TYPE string.",
  "data mepo1313-evers like ekpo-evers.",
  "DATA lt_tab OCCURS 10.",
  "DATA lt_tab OCCURS 10 WITH HEADER LINE.",
  "DATA range TYPE RANGE OF char30 WITH HEADER LINE.",
  "DATA foo TYPE c %_PREDEFINED.",
  "DATA lt_attr_href LIKE SORTED TABLE OF ls_attr_href WITH NON-UNIQUE KEY val.",
  "data bar like range of foo.",
  "DATA foo LIKE RANGE OF cl_abap_typedescr=>kind_elem.",
  "DATA list(250) OCCURS 0 WITH HEADER LINE.",
  "DATA complete_table LIKE SORTED TABLE OF zddic WITH HEADER LINE WITH UNIQUE KEY field1 field2.",
  `DATA foo TYPE TABLE FOR UPDATE EntityItem.`,
  `DATA foo TYPE TABLE FOR READ RESULT EntityItem.`,
  `DATA foo TYPE TABLE FOR ACTION RESULT EntityItem~action.`,
  `DATA ls_data TYPE STRUCTURE FOR HIERARCHY /foo/bar.`,
  `DATA lt_events TYPE TABLE FOR EVENT /foo/bar.`,
  `DATA ls_event  TYPE STRUCTURE FOR EVENT /foo/bar~send.`,
  `DATA range_ko LIKE RANGE OF structure_ref->field.`,
  `DATA wa TYPE zotel_spans WRITER FOR COLUMNS data.`,
  `DATA gt TYPE RANGE OF /foo/bar VALUE IS INITIAL.`,
  `DATA & TYPE c VALUE '&'.`,
  `DATA &sdf TYPE c VALUE '&'.`,
  `DATA &/sdfsd/bar TYPE c VALUE '&'.`,
  `DATA sdf TYPE LINE OF sdfsdf OCCURS 0 WITH HEADER LINE.`,
  `DATA ?trans TYPE trkorr.`,
  `DATA create_rapbo_line TYPE STRUCTURE FOR CREATE ZDMO_R_RAPG_ProjectTP.`,
  `DATA update_field TYPE STRUCTURE FOR UPDATE ZDMO_R_RAPG_FieldTP.`,
  `DATA test_key TYPE STRUCTURE FOR ACTION IMPORT zdmo_r_rapg_projecttp~check_allowed_combinations_det.`,
  `DATA lt LIKE LINE OF tab OCCURS 1 WITH HEADER LINE.`,
  `DATA line? TYPE i.`,
  `DATA li?ne TYPE i.`,
  `DATA ?line TYPE i.`,
  `DATA create_rapbonode_cba_line TYPE STRUCTURE FOR CREATE ZDMO_R_RAPG_ProjectTP\\_Node.`,
  `DATA create_rapbonode_cba TYPE TABLE FOR CREATE ZDMO_R_RAPG_ProjectTP\\_Node.`,
  `DATA permission_request TYPE STRUCTURE FOR PERMISSIONS REQUEST zfoobar.`,
  `DATA update_line TYPE STRUCTURE FOR UPDATE zDMO_R_RAPG_ProjectTP\\\\Project .`,
  `DATA lt_chart_create TYPE TABLE FOR CREATE /dmo/fsa_r_roottp\\\\root\\_chart.`,
  `DATA draft_keys TYPE TABLE FOR DETERMINATION zDMO_R_RAPG_ProjectTP\\\\Node~SetRepositoryObjectNames_det.`,
  `DATA rapbo TYPE STRUCTURE FOR READ RESULT ZDMO_R_RAPG_ProjectTP\\\\node\\_Project .`,
  `data sdf type sdf boxed.`,
  `DATA t_name TYPE STANDARD TABLE OF string VALUE IS INITIAL.`,
  `DATA change TYPE REQUEST FOR CHANGE ZACB_I_Label_S.`,
  `DATA text_tky_link TYPE STRUCTURE FOR READ LINK ZACB_I_Label\\_LabelText.`,
  `data lt_delete type table for delete /foo/bar.`,
  `data lt type table for read import /foo/bar.`,
  `data lt type table for update /foo/bar\\\\/bar/moo.`,
  `DATA f#oo# TYPE i.`,
];

statementType(tests, "DATA", Statements.Data);

statementVersionOk([
  {abap: "DATA foo TYPE TABLE FOR UPDATE EntityItem.", rel: Version.OpenABAP},
], "DATA TYPE TABLE FOR OpenABAP", Statements.Data);

// === RAP derived types ===

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR ACTION IMPORT zentity~zaction.", rel: Release.v773},
  {abap: "DATA t TYPE TABLE FOR ACTION RESULT zentity~zaction.", rel: Release.v773},
  {abap: "DATA t TYPE TABLE FOR FUNCTION IMPORT zentity~zfn.", rel: Release.v773},
  {abap: "DATA t TYPE TABLE FOR FUNCTION RESULT zentity~zfn.", rel: Release.v773},
], "DATA RAP TABLE FOR ACTION/FUNCTION v773", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE STRUCTURE FOR ACTION IMPORT zentity~zaction.", rel: Release.v774},
  {abap: "DATA t TYPE STRUCTURE FOR ACTION RESULT zentity~zaction.", rel: Release.v774},
  {abap: "DATA t TYPE STRUCTURE FOR FUNCTION IMPORT zentity~zfn.", rel: Release.v774},
  {abap: "DATA t TYPE STRUCTURE FOR FUNCTION RESULT zentity~zfn.", rel: Release.v774},
], "DATA RAP STRUCTURE FOR ACTION/FUNCTION v774", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR FAILED LATE zentity.", rel: Release.v774},
  {abap: "DATA t TYPE TABLE FOR MAPPED LATE zentity.", rel: Release.v774},
  {abap: "DATA t TYPE TABLE FOR REPORTED LATE zentity.", rel: Release.v774},
  {abap: "DATA t TYPE STRUCTURE FOR FAILED LATE zentity.", rel: Release.v774},
  {abap: "DATA t TYPE STRUCTURE FOR MAPPED LATE zentity.", rel: Release.v774},
  {abap: "DATA t TYPE STRUCTURE FOR REPORTED LATE zentity.", rel: Release.v774},
], "DATA RAP *LATE v774", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR KEY OF zentity.", rel: Release.v775},
  {abap: "DATA t TYPE STRUCTURE FOR KEY OF zentity.", rel: Release.v775},
], "DATA RAP KEY OF v775", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR DETERMINATION zentity~zdet.", rel: Release.v776},
  {abap: "DATA t TYPE TABLE FOR FAILED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE TABLE FOR FEATURES KEY zentity.", rel: Release.v776},
  {abap: "DATA t TYPE TABLE FOR FEATURES RESULT zentity.", rel: Release.v776},
  {abap: "DATA t TYPE TABLE FOR MAPPED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE TABLE FOR REPORTED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE TABLE FOR VALIDATION zentity~zval.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR DETERMINATION zentity~zdet.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR FAILED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR FEATURES KEY zentity.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR FEATURES REQUEST zentity.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR FEATURES RESULT zentity.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR MAPPED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR REPORTED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE STRUCTURE FOR VALIDATION zentity~zval.", rel: Release.v776},
  {abap: "DATA t TYPE RESPONSE FOR FAILED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE RESPONSE FOR FAILED LATE zentity.", rel: Release.v776},
  {abap: "DATA t TYPE RESPONSE FOR MAPPED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE RESPONSE FOR MAPPED LATE zentity.", rel: Release.v776},
  {abap: "DATA t TYPE RESPONSE FOR REPORTED zentity.", rel: Release.v776},
  {abap: "DATA t TYPE RESPONSE FOR REPORTED LATE zentity.", rel: Release.v776},
], "DATA RAP v776", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR FAILED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE TABLE FOR MAPPED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE TABLE FOR REPORTED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE STRUCTURE FOR FAILED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE STRUCTURE FOR MAPPED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE STRUCTURE FOR REPORTED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE RESPONSE FOR FAILED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE RESPONSE FOR MAPPED EARLY zentity.", rel: Release.v777},
  {abap: "DATA t TYPE RESPONSE FOR REPORTED EARLY zentity.", rel: Release.v777},
], "DATA RAP *EARLY v777", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR CHANGE zentity.", rel: Release.v778},
  {abap: "DATA t TYPE STRUCTURE FOR CHANGE zentity.", rel: Release.v778},
  {abap: "DATA t TYPE REQUEST FOR CHANGE zentity.", rel: Release.v778},
  {abap: "DATA t TYPE REQUEST FOR DELETE zentity.", rel: Release.v778},
], "DATA RAP CHANGE/DELETE v778", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE STRUCTURE FOR ACTION REQUEST zentity~zaction.", rel: Release.v779},
  {abap: "DATA t TYPE STRUCTURE FOR FUNCTION REQUEST zentity~zfn.", rel: Release.v779},
], "DATA RAP REQUEST v779", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR AUTHORIZATION RESULT zentity.", rel: Release.v780},
  {abap: "DATA t TYPE TABLE FOR PERMISSIONS KEY zentity.", rel: Release.v780},
  {abap: "DATA t TYPE STRUCTURE FOR AUTHORIZATION REQUEST zentity.", rel: Release.v780},
  {abap: "DATA t TYPE STRUCTURE FOR AUTHORIZATION RESULT zentity.", rel: Release.v780},
  {abap: "DATA t TYPE STRUCTURE FOR PERMISSIONS KEY zentity.", rel: Release.v780},
  {abap: "DATA t TYPE STRUCTURE FOR PERMISSIONS REQUEST zentity.", rel: Release.v780},
  {abap: "DATA t TYPE STRUCTURE FOR PERMISSIONS RESULT zentity.", rel: Release.v780},
], "DATA RAP PERMISSIONS/AUTH v780", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "DATA t TYPE TABLE FOR FEATURES KEY zentity.", rel: Release.v781},
  {abap: "DATA t TYPE TABLE FOR INSTANCE AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "DATA t TYPE TABLE FOR INSTANCE AUTHORIZATION REQUEST zentity.", rel: Release.v781},
  {abap: "DATA t TYPE TABLE FOR INSTANCE AUTHORIZATION RESULT zentity.", rel: Release.v781},
  {abap: "DATA t TYPE TABLE FOR INSTANCE FEATURES KEY zentity.", rel: Release.v781},
  {abap: "DATA t TYPE TABLE FOR INSTANCE FEATURES REQUEST zentity.", rel: Release.v781},
  {abap: "DATA t TYPE TABLE FOR INSTANCE FEATURES RESULT zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR INSTANCE AUTHORIZATION KEY zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR INSTANCE AUTHORIZATION REQUEST zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR INSTANCE AUTHORIZATION RESULT zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR INSTANCE FEATURES KEY zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR INSTANCE FEATURES REQUEST zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR INSTANCE FEATURES RESULT zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR GLOBAL AUTHORIZATION REQUEST zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR GLOBAL AUTHORIZATION RESULT zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR GLOBAL FEATURES REQUEST zentity.", rel: Release.v781},
  {abap: "DATA t TYPE STRUCTURE FOR GLOBAL FEATURES RESULT zentity.", rel: Release.v781},
], "DATA RAP GLOBAL/INSTANCE v781", Statements.Data);

statementVersionOk([
  {abap: "DATA t TYPE TABLE FOR READ CHANGES zentity.", rel: Release.v915},
  {abap: "DATA t TYPE STRUCTURE FOR READ CHANGES zentity.", rel: Release.v915},
], "DATA RAP READ CHANGES v915", Statements.Data);

const fails = [
  `DATA something TYPE STANDARD TABLE OF  WITH DEFAULT KEY.`, // missing type
];
statementExpectFail(fails, "DATA");
