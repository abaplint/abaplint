import {runMulti, testRule} from "./_utils";
import {UnknownTypes} from "../../src/rules";
import {expect} from "chai";

// note that the errorNamespace is respected

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: "DATA foo TYPE zint4.", cnt: 1},
  {abap: "DATA foo TYPE foomoo.", cnt: 0},

  {abap: `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS: moo.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.`, cnt: 0},

  {abap: `
CLASS lcl_foobar DEFINITION.
PUBLIC SECTION.
  METHODS: moo
    IMPORTING iv_foo TYPE string.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.`, cnt: 0},

  {abap: `
CLASS lcl_foobar DEFINITION.
  PUBLIC SECTION.
    METHODS: moo
      RETURNING VALUE(rv_foo) TYPE string.
ENDCLASS.
CLASS lcl_foobar IMPLEMENTATION.
  METHOD moo.
  ENDMETHOD.
ENDCLASS.`, cnt: 0},
];

testRule(tests, UnknownTypes);

const key = "unknown_types";


describe("unknown_types Rule", () => {

  it("TABL, error", () => {
    const abap = `
REPORT zfoobar.
DATA ls_tadir TYPE ztadir.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
  });

  it("SELECT-OPTIONS, this becomes a void reference", () => {
    const abap = `SELECT-OPTIONS foo FOR structure-field.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("LIKE ddic allowed in PROGs", () => {
    const abap = `DATA foo LIKE voided-rcode.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("LIKE ddic allowed in PROGs", () => {
    const abap = `DATA foo LIKE voided.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("LIKE ddic should give error in a class", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    DATA bar LIKE usr02.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(1);
  });

  it("TABL, minimal example", () => {
    const tabl = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>TADIR</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <DDTEXT>TADIR</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>4</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>TADIR</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>TADIR</TABNAME>
     <FIELDNAME>PGMID</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0001</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>TADIR</TABNAME>
     <FIELDNAME>OBJECT</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0002</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>TADIR</TABNAME>
     <FIELDNAME>OBJ_NAME</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0003</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000080</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000040</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const abap = `
REPORT zfoobar.
DATA ls_tadir TYPE ztadir.`;

    let issues = runMulti([
      {filename: "ztadir.tabl.xml", contents: tabl},
      {filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("check CLAS can use itself", () => {
    const abap = `CLASS zcl_foobar DEFINITION PUBLIC CREATE PROTECTED.
  PUBLIC SECTION.
    CLASS-METHODS new
      RETURNING
        VALUE(ro_foobar) TYPE REF TO zcl_foobar.
ENDCLASS.

CLASS zcl_foobar IMPLEMENTATION.
  METHOD new.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zcl_foobar.clas.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("protected and private attribute", () => {
    const abap = `CLASS zcl_foobar DEFINITION PUBLIC CREATE PROTECTED.
  PROTECTED SECTION.
    DATA mv_errty TYPE sci_errty.
  PRIVATE SECTION.
    TYPES:
      BEGIN OF ty_source,
        name TYPE level_name,
        code TYPE string_table,
      END OF ty_source .
    TYPES:
      ty_source_tt TYPE SORTED TABLE OF ty_source WITH UNIQUE KEY name .

    DATA mt_source TYPE ty_source_tt .
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zcl_foobar.clas.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("ms_metadata could not be resolved, expect error", () => {
    const abap = `
CLASS zcl_abapgit_xml DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    DATA ms_metadata TYPE zif_abapgit_definitions=>ty_metadata.
ENDCLASS.

CLASS zcl_abapgit_xml IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zcl_abapgit_xml.clas.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.not.contain("fallback");
  });

  it("mi_ixml should be void", () => {
    const abap1 = `
CLASS zcl_abapgit_xml DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
  DATA: mi_ixml TYPE REF TO if_ixml.
ENDCLASS.

CLASS zcl_abapgit_xml IMPLEMENTATION.
ENDCLASS.`;
    const abap2 = `DATA foo TYPE REF TO zcl_abapgit_xml.`;
    let issues = runMulti([
      {filename: "zcl_abapgit_xml.clas.abap", contents: abap1},
      {filename: "zfoobar.prog.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("mi_ixml should be void", () => {
    const abap1 = `
CLASS zcl_abapgit_xml DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
  DATA: mi_ixml TYPE REF TO if_ixml.
ENDCLASS.

CLASS zcl_abapgit_xml IMPLEMENTATION.
ENDCLASS.`;
    const abap2 = `DATA foo TYPE REF TO zcl_abapgit_xml.`;
    let issues = runMulti([
      {filename: "zcl_abapgit_xml.clas.abap", contents: abap1},
      {filename: "zfoobar.prog.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("reference type in interface", () => {
    const abap1 = `
CLASS zcl_abapgit_xml DEFINITION PUBLIC CREATE PUBLIC.
  PROTECTED SECTION.
    DATA: foo TYPE i,
          ms_metadata TYPE zif_abapgit_definitions=>ty_metadata.
ENDCLASS.

CLASS zcl_abapgit_xml IMPLEMENTATION.
ENDCLASS.`;
    const abap2 = `
INTERFACE zif_abapgit_definitions PUBLIC .
  TYPES:
    BEGIN OF ty_metadata,
      foo TYPE REF TO if_something,
      ddic TYPE abap_bool,
    END OF ty_metadata.
ENDINTERFACE.`;
    let issues = runMulti([
      {filename: "zcl_abapgit_xml.clas.abap", contents: abap1},
      {filename: "zif_abapgit_definitions.intf.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("two classes", () => {
    const abap1 = `
CLASS zcl_class1 DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    DATA bar TYPE REF TO if_something.
    DATA moo TYPE zcl_class2=>foo.
ENDCLASS.

CLASS zcl_class1 IMPLEMENTATION.
ENDCLASS.`;
    const abap2 = `
CLASS zcl_class2 DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    DATA bar TYPE REF TO if_something.
    TYPES foo TYPE i.
ENDCLASS.

CLASS zcl_class2 IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zcl_class1.clas.abap", contents: abap1},
      {filename: "zcl_class2.clas.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("data reference to itself", () => {
    const abap1 = `
CLASS zcx_root DEFINITION ABSTRACT PUBLIC.
  PUBLIC SECTION.
    DATA previous TYPE REF TO zcx_root.
ENDCLASS.
CLASS zcx_root IMPLEMENTATION.
ENDCLASS.`;
    const abap2 = `
CLASS zcx_static_check DEFINITION PUBLIC INHERITING FROM zcx_root CREATE PUBLIC ABSTRACT.
ENDCLASS.
CLASS zcx_static_check IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zcx_root.clas.abap", contents: abap1},
      {filename: "zcx_static_check.clas.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("swag typing", () => {
    const abap1 = `
INTERFACE zif_swag_handler PUBLIC.
  METHODS meta
    RETURNING
      VALUE(rt_meta) TYPE zcl_swag=>ty_meta_tt.
ENDINTERFACE.`;

    const abap2 = `
CLASS zcl_swag DEFINITION PUBLIC CREATE PUBLIC .
  PUBLIC SECTION.
    TYPES: ty_meta_tt TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
ENDCLASS.

CLASS ZCL_SWAG IMPLEMENTATION.
ENDCLASS.`;

    const abap3 = `
CLASS zcl_swag_example_handler DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_swag_handler.
ENDCLASS.

CLASS ZCL_SWAG_EXAMPLE_HANDLER IMPLEMENTATION.
  METHOD zif_swag_handler~meta.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zif_swag_handler.intf.abap", contents: abap1},
      {filename: "zcl_swag.clas.abap", contents: abap2},
      {filename: "zcl_swag_example_handler.clas.abap", contents: abap3},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("cyclic referencing classes via types", () => {
    const abap1 = `
CLASS zcl_class1 DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES type TYPE i.
    TYPES type2 TYPE zcl_class2=>type.
    DATA data TYPE zcl_class2=>type.
ENDCLASS.
CLASS zcl_class1 IMPLEMENTATION.
ENDCLASS.`;
    const abap2 = `
CLASS zcl_class2 DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES type TYPE i.
    TYPES type2 TYPE zcl_class1=>type.
    DATA data TYPE zcl_class1=>type.
ENDCLASS.
CLASS zcl_class2 IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zcl_class1.clas.abap", contents: abap1},
      {filename: "zcl_class2.clas.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("should not be able to find interface type without prefix", () => {
    const abap1 = `
INTERFACE lif_foo.
  TYPES ty_foo TYPE i.
ENDINTERFACE.
DATA moo TYPE ty_foo.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
  });

  it("TYPE reference itself via prefix", () => {
    const abap1 = `
INTERFACE zif_abapgit_definitions PUBLIC.
  TYPES:
    ty_sha1 TYPE c LENGTH 40 .
  TYPES:
    ty_itself TYPE zif_abapgit_definitions=>ty_sha1.
ENDINTERFACE.`;
    const abap2 = `
REPORT zfoobar.
DATA foo TYPE zif_abapgit_definitions=>ty_itself.`;
    let issues = runMulti([
      {filename: "zif_abapgit_definitions.intf.abap", contents: abap1},
      {filename: "zfoobar.prog.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("local interface prefix is current", () => {
    const abap1 = `
INTERFACE lif_foo.
  TYPES ty_foo TYPE i.
  TYPES ty_moo TYPE lif_foo=>ty_foo.
ENDINTERFACE.
DATA moo TYPE lif_foo=>ty_moo.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("local class prefix is current", () => {
    const abap1 = `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    TYPES ty_foo TYPE i.
    TYPES ty_moo TYPE lcl_foo=>ty_foo.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
ENDCLASS.
DATA moo TYPE lcl_foo=>ty_moo.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("events", () => {
    const abap1 = `
CLASS lcl_eventer DEFINITION.
  PUBLIC SECTION.
    EVENTS event EXPORTING VALUE(action) TYPE string.
ENDCLASS.
CLASS lcl_eventer IMPLEMENTATION.
ENDCLASS.

CLASS lcl_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_event FOR EVENT event OF lcl_eventer IMPORTING action.
ENDCLASS.

CLASS lcl_handler IMPLEMENTATION.
  METHOD on_event.
    WRITE action.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("events, exclamation mark", () => {
    const abap1 = `
CLASS lcl_eventer DEFINITION.
  PUBLIC SECTION.
    EVENTS event EXPORTING VALUE(action) TYPE string.
ENDCLASS.
CLASS lcl_eventer IMPLEMENTATION.
ENDCLASS.

CLASS lcl_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_event FOR EVENT event OF lcl_eventer IMPORTING !action.
ENDCLASS.

CLASS lcl_handler IMPLEMENTATION.
  METHOD on_event.
    WRITE action.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("types, zcl_zlib", () => {
    const abap1 = `
CLASS zcl_zlib DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES: public_type type i.
  PRIVATE SECTION.
    TYPES: BEGIN OF ty_pair,
             length   TYPE i,
             distance TYPE i,
           END OF ty_pair.
    CLASS-METHODS:
      copy_out
        IMPORTING is_pair TYPE ty_pair.
ENDCLASS.

CLASS zcl_zlib IMPLEMENTATION.
  METHOD copy_out.
    WRITE is_pair-length.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zcl_zlib.clas.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("type from super class in implementation", () => {
    const abap1 = `
CLASS lcl_super DEFINITION.
  PUBLIC SECTION.
    TYPES: ty_foo TYPE i.
ENDCLASS.
CLASS lcl_super IMPLEMENTATION.
ENDCLASS.

CLASS lcl_sub DEFINITION INHERITING FROM lcl_super.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS lcl_sub IMPLEMENTATION.
  METHOD bar.
    DATA foo TYPE ty_foo.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zprog.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("global class with local class", () => {
    const abap1 = `
CLASS zcl_local_minimal DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PRIVATE SECTION.
    METHODS methodname.
ENDCLASS.

CLASS zcl_local_minimal IMPLEMENTATION.
  METHOD methodname.
    DATA foo TYPE REF TO lcl_local.
  ENDMETHOD.
ENDCLASS.`;
    const abap2 = `
CLASS lcl_local DEFINITION.
ENDCLASS.
CLASS lcl_local IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zcl_local_minimal.clas.abap", contents: abap1},
      {filename: "zcl_local_minimal.clas.locals_imp.abap", contents: abap2},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("events, void class name", () => {
    const abap1 = `
CLASS lcl_handler DEFINITION.
  PUBLIC SECTION.
    METHODS on_event FOR EVENT sapevent OF cl_gui_html_viewer
      IMPORTING action frame.
ENDCLASS.

CLASS lcl_handler IMPLEMENTATION.
  METHOD on_event.
    WRITE action.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("factory, reference itself locally", () => {
    const abap1 = `
CLASS lcl_gui_services_dummy DEFINITION FINAL.
  PUBLIC SECTION.
    CLASS-METHODS create
      RETURNING
        VALUE(ro_instance) TYPE REF TO lcl_gui_services_dummy.
ENDCLASS.

CLASS lcl_gui_services_dummy IMPLEMENTATION.
  METHOD create.
    CREATE OBJECT ro_instance.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("interface tilde typing name, implementation", () => {
    const abap1 = `
INTERFACE lif_intf.
  TYPES ty_foo TYPE i.
ENDINTERFACE.

CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    INTERFACES: lif_intf.
    METHODS name.
ENDCLASS.

CLASS lcl_clas IMPLEMENTATION.
  METHOD name.
    DATA foo TYPE lif_intf~ty_foo.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("interface tilde typing name, definition", () => {
    const abap1 = `
INTERFACE lif_intf.
  TYPES ty_foo TYPE i.
ENDINTERFACE.

CLASS lcl_clas DEFINITION.
  PUBLIC SECTION.
    INTERFACES: lif_intf.
    DATA foo TYPE lif_intf~ty_foo.
ENDCLASS.

CLASS lcl_clas IMPLEMENTATION.

ENDCLASS.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("testclass referencing local class in global class", () => {
    const abap1 = `
CLASS zcl_local_minimal DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.

CLASS zcl_local_minimal IMPLEMENTATION.
ENDCLASS.`;
    const abap2 = `
CLASS lcl_local DEFINITION.
ENDCLASS.
CLASS lcl_local IMPLEMENTATION.
ENDCLASS.`;
    const abap3 = `
CLASS ltcl_foobar DEFINITION FOR TESTING DURATION SHORT RISK LEVEL HARMLESS.
  PRIVATE SECTION.
    DATA foo TYPE REF TO lcl_local.
ENDCLASS.
CLASS ltcl_foobar IMPLEMENTATION.
ENDCLASS.
`;
    let issues = runMulti([
      {filename: "zcl_local_minimal.clas.abap", contents: abap1},
      {filename: "zcl_local_minimal.clas.locals_imp.abap", contents: abap2},
      {filename: "zcl_local_minimal.clas.testclasses.abap", contents: abap3},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("DTEL test", () => {
    const abap1 = `
CLASS zcl_example DEFINITION PUBLIC FINAL CREATE PUBLIC .
  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
    METHODS method_name
    IMPORTING
      input TYPE zdtel.
ENDCLASS.
CLASS zcl_example IMPLEMENTATION.
  METHOD method_name.
  ENDMETHOD.
ENDCLASS.`;
    const dtel = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDTEL</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DDTEXT>data element</DDTEXT>
    <REPTEXT>data element</REPTEXT>
    <SCRTEXT_S>data eleme</SCRTEXT_S>
    <SCRTEXT_M>data element</SCRTEXT_M>
    <SCRTEXT_L>data element</SCRTEXT_L>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    let issues = runMulti([
      {filename: "zcl_example.clas.abap", contents: abap1},
      {filename: "zdtel.dtel.xml", contents: dtel},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("DTEL referencing voided domain", () => {
    const abap1 = `
CLASS zcl_example DEFINITION PUBLIC FINAL CREATE PUBLIC .
  PUBLIC SECTION.
  PROTECTED SECTION.
  PRIVATE SECTION.
    METHODS method_name
    IMPORTING
      input TYPE zmid.
ENDCLASS.
CLASS zcl_example IMPLEMENTATION.
  METHOD method_name.
  ENDMETHOD.
ENDCLASS.`;
    const dtel = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZMID</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DOMNAME>DML_OBJECT</DOMNAME>
    <HEADLEN>20</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <DDTEXT>Message Id</DDTEXT>
    <REPTEXT>Message ID</REPTEXT>
    <SCRTEXT_S>Msg Id</SCRTEXT_S>
    <DTELMASTER>E</DTELMASTER>
    <REFKIND>D</REFKIND>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    let issues = runMulti([
      {filename: "zcl_example.clas.abap", contents: abap1},
      {filename: "zmid.dtel.xml", contents: dtel},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("TABL, minimal example, dash", () => {
    const tabl = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>TADIR</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <DDTEXT>TADIR</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>4</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>TADIR</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>TADIR</TABNAME>
     <FIELDNAME>PGMID</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0001</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>TADIR</TABNAME>
     <FIELDNAME>OBJECT</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0002</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>TADIR</TABNAME>
     <FIELDNAME>OBJ_NAME</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0003</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000080</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000040</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const abap = `
REPORT zfoobar.
DATA ls_tadir TYPE ztadir-object.`;

    let issues = runMulti([
      {filename: "ztadir.tabl.xml", contents: tabl},
      {filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("events via alias", () => {
    const abap1 = `
INTERFACE if_top.
  EVENTS click
    EXPORTING
      VALUE(parm1) TYPE string
      VALUE(parm2) TYPE string.
ENDINTERFACE.

INTERFACE if_sub.
  INTERFACES if_top.
  ALIASES click FOR if_top~click.
ENDINTERFACE.

CLASS lcl_sdf DEFINITION.
  PUBLIC SECTION.
    METHODS: on_click FOR EVENT click OF if_sub
      IMPORTING
          parm1 parm2.
ENDCLASS.

CLASS lcl_sdf IMPLEMENTATION.
  METHOD on_click.
    WRITE parm1.
    WRITE parm2.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap1},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("Two interfaces and a program", () => {
    const repo = `
    INTERFACE zif_repo PUBLIC.
    ENDINTERFACE.`;
    const definitions = `
    INTERFACE zif_abapgit_definitions PUBLIC.
      DATA repo TYPE REF TO zif_repo.

      TYPES: BEGIN OF ty_item,
               obj_type TYPE tadir-object,
               obj_name TYPE tadir-obj_name,
               devclass TYPE devclass,
               inactive TYPE abap_bool,
             END OF ty_item .
    ENDINTERFACE.`;
    const persistence = `
    INTERFACE zif_abapgit_persistence PUBLIC.
      TYPES: BEGIN OF ty_repo_xml,
               item TYPE zif_abapgit_definitions=>ty_item,
             END OF ty_repo_xml.

      TYPES: BEGIN OF ty_repo,
               key TYPE string.
               INCLUDE TYPE ty_repo_xml.
      TYPES: END OF ty_repo.
    ENDINTERFACE.`;
    const prog = `DATA: ls_data TYPE zif_abapgit_persistence=>ty_repo.`;
    let issues = runMulti([
      {filename: "zif_abapgit_persistence.intf.abap", contents: persistence},
      {filename: "zif_abapgit_definitions.intf.abap", contents: definitions},
      {filename: "zif_repo.intf.abap", contents: repo},
      {filename: "ztwo_interfaces.prog.abap", contents: prog},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("Type from super", () => {
    const abap = `
CLASS lcl_fiori_moni_mpc DEFINITION CREATE PUBLIC.
  PUBLIC SECTION.
    TYPES:
      BEGIN OF ty_appinfo,
        user_id TYPE string,
      END OF ty_appinfo.
ENDCLASS.
CLASS lcl_fiori_moni_mpc IMPLEMENTATION.
ENDCLASS.

CLASS lcl_fiori_moni_mpc_ext DEFINITION INHERITING FROM lcl_fiori_moni_mpc CREATE PUBLIC.
ENDCLASS.
CLASS lcl_fiori_moni_mpc_ext IMPLEMENTATION.
ENDCLASS.

DATA: ls_appinfo TYPE lcl_fiori_moni_mpc_ext=>ty_appinfo.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("unknown type in interface", () => {
    const abap = `
INTERFACE zif_utyp PUBLIC .
  TYPES contains_unknown TYPE zif_sdfsd=>bar.
ENDINTERFACE.`;
    let issues = runMulti([
      {filename: "zif_utyp.intf.abap", contents: abap},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
  });

  it("Type from super via interface", () => {
    const abap = `
INTERFACE zif_service.
  TYPES ty_char_top TYPE c LENGTH 1.
ENDINTERFACE.

CLASS zcl_top DEFINITION.
  PUBLIC SECTION.
    INTERFACES zif_service.
ENDCLASS.
CLASS zcl_top IMPLEMENTATION.
ENDCLASS.

CLASS zcl_class DEFINITION INHERITING FROM zcl_top.
  PUBLIC SECTION.
    TYPES ty_char TYPE zif_service~ty_char_top.
ENDCLASS.
CLASS zcl_class IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("APPEND INITIAL LINE with inline", () => {
    const abap = `
    DATA tab TYPE STANDARD TABLE OF i.
    APPEND INITIAL LINE TO tab ASSIGNING FIELD-SYMBOL(<ls_tab1>).
    WRITE <ls_tab1>.`;
    let issues = runMulti([
      {filename: "zreport.prog.abap", contents: abap},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("METHOD with LIKE interface variable", () => {
    const abap = `
INTERFACE lif_bar.
  DATA foo TYPE i.
ENDINTERFACE.
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS moo IMPORTING bar LIKE lif_bar=>foo OPTIONAL.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD moo.
    WRITE bar.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("BEGIN with LIKE LINE OF", () => {
    const abap = `
DATA: BEGIN OF lt_char_file OCCURS 0,
        zstring(72),
      END OF lt_char_file.

DATA BEGIN OF lt_file OCCURS 0.
DATA: line LIKE LINE OF lt_char_file,
      END OF lt_file.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("LIKE types", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    DATA: BEGIN OF _geometry,
            type        TYPE string,
          END OF _geometry.
    DATA: BEGIN OF _linestring,
            type       TYPE string,
            geometry   LIKE _geometry,
          END OF _linestring.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("INTERFACE, local type reference", () => {
    const abap = `
INTERFACE zif_abapgit_auth.
  TYPES ty_authorization TYPE string.
  DATA foo TYPE ty_authorization.
ENDINTERFACE.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("LIKE LINE OF me->worksheet->sheet_content", () => {
    const abap = `
CLASS foobar DEFINITION.
  PUBLIC SECTION.
    DATA worksheet TYPE REF TO foobar.
    DATA sheet_content TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
    METHODS moo.
ENDCLASS.

CLASS foobar IMPLEMENTATION.
  METHOD moo.
    FIELD-SYMBOLS: <bar> LIKE LINE OF me->worksheet->sheet_content.
    WRITE <bar>.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("interface with unknown method parameter reference", () => {
    const abap = `INTERFACE zif_foobar PUBLIC.
      METHODS bar RETURNING VALUE(ref) TYPE REF TO zcl_not_found.
    ENDINTERFACE.`;
    let issues = runMulti([{filename: "zif_foobar.intf.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(1);
  });

  it("clas with unknown method parameter reference", () => {
    const abap = `CLASS zcl_foobar DEFINITION PUBLIC.
      PUBLIC SECTION.
        METHODS bar RETURNING VALUE(ref) TYPE REF TO zcl_not_found.
    ENDCLASS.
    CLASS zcl_foobar IMPLEMENTATION.
      METHOD bar.
      ENDMETHOD.
    ENDCLASS.`;
    let issues = runMulti([{filename: "zcl_foobar.clas.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(1);
  });

  it("interface with TYPE data", () => {
    const abap = `INTERFACE zif_foobar PUBLIC.
      METHODS bar EXPORTING data TYPE DATA.
      METHODS get_body_data
      IMPORTING
        content_handler TYPE REF TO object
      EXPORTING
        data            TYPE data.
    ENDINTERFACE.`;
    let issues = runMulti([{filename: "zif_foobar.intf.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("data reference LIKE REF TO", () => {
    const abap = `
TYPES: BEGIN OF ty_struc,
         name TYPE string,
       END OF ty_struc.
DATA tab TYPE STANDARD TABLE OF ty_struc WITH DEFAULT KEY.
DATA row LIKE LINE OF tab.
DATA ref LIKE REF TO row.
row-name = 'bar'.
APPEND row TO tab.
READ TABLE tab REFERENCE INTO ref WITH KEY name = 'bar'.
WRITE ref->name.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("badi reference", () => {
    const enhs = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_ENHS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TOOL>BADI_DEF</TOOL>
   <SHORTTEXT>test</SHORTTEXT>
   <BADI_DATA>
    <ENH_BADI_DATA>
     <BADI_NAME>ZBADIDEF</BADI_NAME>
     <CONTEXT_MODE>N</CONTEXT_MODE>
     <BADI_SHORTTEXT>def</BADI_SHORTTEXT>
     <BADI_SHORTTEXT_ID>0242AC1100021EDB9A8FC1D1BA8CD772</BADI_SHORTTEXT_ID>
    </ENH_BADI_DATA>
   </BADI_DATA>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const abap = `DATA foo TYPE REF TO zbadidef.`;
    let issues = runMulti([
      {filename: "zbadiname.enhs.xml", contents: enhs},
      {filename: "zprog.prog.abap", contents: abap},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("constant referenced via chain", () => {
    const abap = `
CLASS lcl_class DEFINITION.
  PUBLIC SECTION.
    CONSTANTS:
      BEGIN OF gc_struct,
        val_a TYPE c LENGTH 1 VALUE 'A',
      END OF gc_struct.
ENDCLASS.
CLASS lcl_class IMPLEMENTATION.
ENDCLASS.
CONSTANTS:
  gc_2 TYPE c LENGTH 1 VALUE lcl_class=>gc_struct-val_a.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

});