import {runMulti, testRule} from "./_utils";
import {UnknownTypes} from "../../src/rules";
import {expect} from "chai";
import {Config, IConfiguration} from "../../src";

// note that the errorNamespace is respected

function fullErrorNamespace(): IConfiguration {
  const conf = Config.getDefault().get();
  conf.syntax.errorNamespace = ".";
  return new Config(JSON.stringify(conf));
}

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

  it("LIKE ddic allowed in PROGs, 1", () => {
    const abap = `DATA foo LIKE voided-rcode.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("LIKE ddic allowed in PROGs, 2", () => {
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

  it("dynamic should become void", () => {
    const abap = `ASSIGN ('BLAH') TO FIELD-SYMBOL(<lv_fval>).`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("ENUM type", () => {
    const abap = `TYPES: BEGIN OF ENUM ty_moo BASE TYPE c,
    undefined VALUE IS INITIAL,
  END OF ENUM ty_moo.
  DATA moo TYPE ty_moo.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("EVENTS, implicit SENDER parameter", () => {
    const abap = `
INTERFACE bar.
  EVENTS moo.
ENDINTERFACE.

CLASS clas DEFINITION.
  PUBLIC SECTION.
    METHODS on_moo FOR EVENT moo OF bar
      IMPORTING sender.
ENDCLASS.
CLASS clas IMPLEMENTATION.
  METHOD on_moo.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("reference private type from private method", () => {
    const abap = `
CLASS lcl DEFINITION.
  PRIVATE SECTION.
    TYPES ty_bar TYPE c LENGTH 1.
    METHODS moo.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD moo.
    DATA data TYPE ty_bar.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("reference unknown type in class", () => {
    const abap = `
CLASS lcl DEFINITION.
  PRIVATE SECTION.
    METHODS moo.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD moo.
    DATA data TYPE lcl=>ty_asdf.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(1);
  });

  it("LIKE RANGE OF constant", () => {
    const abap = `DATA lt_not LIKE RANGE OF abap_true.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("Refer to TYPE from TYPE POOL", () => {
    const pool = `
    TYPE-POOL zfoo.
    TYPES zfoo_moo TYPE c LENGTH 5.`;
    const prog = `DATA bar TYPE zfoo_moo.`;
    let issues = runMulti([
      {filename: "zfoo.type.abap", contents: pool},
      {filename: "zreport.prog.abap", contents: prog}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("Unknown constant, should be voided with value undefined", () => {
    const abap = `CONSTANTS c_tab LIKE cl_abap_char_utilities=>horizontal_tab VALUE cl_abap_char_utilities=>horizontal_tab.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("Constant, found", () => {
    const clas = `CLASS cl_abap_char_utilities DEFINITION PUBLIC.
    PUBLIC SECTION.
      CONSTANTS horizontal_tab TYPE c LENGTH 1 VALUE 'A'.
  ENDCLASS.
  CLASS cl_abap_char_utilities IMPLEMENTATION.
  ENDCLASS.`;
    const abap = `constants c_tab like cl_abap_char_utilities=>horizontal_tab value cl_abap_char_utilities=>horizontal_tab.`;
    let issues = runMulti([
      {filename: "zprog.prog.abap", contents: abap},
      {filename: "cl_abap_char_utilities.clas.abap", contents: clas},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("structured constants", () => {
    const abap = `
  types:
    TY_RC type c length 2 .

  constants:
    begin of ZCX_TEXT2TAB_ERROR,
      msgid type symsgid value 'SY',
      msgno type symsgno value '499',
      attr1 type scx_attrname value 'METHNAME',
      attr2 type scx_attrname value 'MSG',
      attr3 type scx_attrname value 'LOCATION',
      attr4 type scx_attrname value '',
    end of ZCX_TEXT2TAB_ERROR .

    DATA foo type ty_rc.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("determine type, INSERT INITIAL LINE INTO TABLE", () => {
    const abap = `
  DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
  INSERT INITIAL LINE INTO TABLE tab ASSIGNING FIELD-SYMBOL(<row>).`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("FORM, STRUCTURE", () => {
    const zlauf = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZLAUF</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>test</DDTEXT>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>FOO</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000002</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000001</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const abap = `
FORM bar TABLES sdf STRUCTURE zlauf.
ENDFORM.`;
    let issues = runMulti([
      {filename: "zlauf.tabl.xml", contents: zlauf},
      {filename: "zprog.prog.abap", contents: abap},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("use enum type from interface", () => {
    const abap = `
INTERFACE lcl_bar.
  TYPES: BEGIN OF ENUM enum1,
           val1,
         END OF ENUM enum1.
ENDINTERFACE.

DATA sdf TYPE lcl_bar=>enum1.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("type in interface from interface via alias", () => {
    const abap = `
INTERFACE lcl_bar.
  TYPES ty_bar TYPE c LENGTH 1.
ENDINTERFACE.

INTERFACE lcl_top.
  INTERFACES lcl_bar.
  ALIASES ty_bar FOR lcl_bar~ty_bar.
  METHODS bar IMPORTING field TYPE ty_bar.
ENDINTERFACE.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(0);
  });

  it("global class, method returning type unknown", () => {
    const abap = `
CLASS zcl_bar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS bar
      RETURNING VALUE(ref) TYPE zusedprog.
ENDCLASS.

CLASS zcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zcl_bar.clas.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(1);
  });

  it("Unknown implemented interface", () => {
    const abap = `
CLASS bar DEFINITION.
  PUBLIC SECTION.
    INTERFACES zunknown.
ENDCLASS.

CLASS bar IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zsdfsd.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equals(1);
  });

  it("ok, LIKE LINE OF is_message-sub-lines", () => {
    const abap = `
TYPES:
  BEGIN OF ty_message,
    BEGIN OF sub,
      lines TYPE STANDARD TABLE OF string WITH DEFAULT KEY,
    END OF sub,
  END OF ty_message.
DATA is_message TYPE ty_message.
DATA ls_line LIKE LINE OF is_message-sub-lines.`;
    let issues = runMulti([{filename: "zprog.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("No class/method implementation but DEFAULT not found", () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo
      IMPORTING
        moo TYPE i DEFAULT not_found.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("not_found");
  });

  it("type in class method parameter via alias from interface", () => {
    const abap = `INTERFACE lif.
  TYPES moo TYPE i.
ENDINTERFACE.

CLASS lcl DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif.
    ALIASES ty_moo FOR lif~moo.
    METHODS bar IMPORTING sdf TYPE ty_moo.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("type to aliased type", () => {
    const abap = `
INTERFACE lif.
  TYPES zoption TYPE i.
ENDINTERFACE.

CLASS lcl DEFINITION FINAL CREATE PROTECTED.
  PUBLIC SECTION.
    INTERFACES lif.
    ALIASES zoption FOR lif~zoption.
    TYPES moo TYPE zoption.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("event defined in class, local handler for itself", () => {
    const abap = `
CLASS zcl_local_event DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    EVENTS created
      EXPORTING
        VALUE(name) TYPE string.
    METHODS on_created
      FOR EVENT created OF zcl_local_event
      IMPORTING
        !name.
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.

CLASS zcl_local_event IMPLEMENTATION.
  METHOD on_created.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zcl_local_event.clas.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("reference to itself, voided structure type", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES BEGIN OF ty_s_object_table.
    INCLUDE TYPE objsl AS objsl.
    TYPES foo TYPE string.
    TYPES END OF ty_s_object_table.

    METHODS do_delete
      IMPORTING
        iv_table_name TYPE lcl=>ty_s_object_table-tobj_name.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD do_delete.
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zlocalref.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equals(undefined);
  });

  it("type pool and class", () => {
    const pool = `
TYPE-POOL abap.
TYPES: BEGIN OF abap_componentdescr,
         name TYPE string,
         type TYPE REF TO zcl_abap_datadescr,
       END OF abap_componentdescr.`;

    const cl_abap_typedescr = `CLASS zcl_abap_typedescr DEFINITION.
  PUBLIC SECTION.
ENDCLASS.
CLASS zcl_abap_typedescr IMPLEMENTATION.
ENDCLASS.`;

    const cl_abap_datadescr = `CLASS zcl_abap_datadescr DEFINITION PUBLIC INHERITING FROM zcl_abap_typedescr.
  PUBLIC SECTION.
ENDCLASS.
CLASS zcl_abap_datadescr IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([
      {filename: "zcl_abap_typedescr.clas.abap", contents: cl_abap_typedescr},
      {filename: "zcl_abap_datadescr.clas.abap", contents: cl_abap_datadescr},
      {filename: "abap.type.abap", contents: pool},
    ]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  it("expect error, ZNOTFOUND not found", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS call IMPORTING foo TYPE string.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD call.
    call( VALUE znotfound( ) ).
  ENDMETHOD.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("ZNOTFOUND");
  });

  it("class events", () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    EVENTS double_click
      EXPORTING
        VALUE(row) TYPE znotfound.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("ZNOTFOUND");
  });

  it("TYPES, key field not part of structure", () => {
    const abap = `
    TYPES: BEGIN OF albums_typee,
             artist_id  TYPE string,
           END OF albums_typee.
    TYPES albums TYPE STANDARD TABLE OF albums_typee WITH KEY artist_id album_id.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.include("not part of structure");
  });

  it("DATA, key field not part of structure", () => {
    const abap = `
    TYPES: BEGIN OF albums_typee,
             artist_id  TYPE string,
           END OF albums_typee.
    DATA albums TYPE STANDARD TABLE OF albums_typee WITH KEY artist_id album_id.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
    expect(issues[0]?.getMessage()).to.include("not part of structure");
  });

  it("DATA, ok field part of structure", () => {
    const abap = `
    TYPES: BEGIN OF albums_typee,
             artist_id  TYPE string,
           END OF albums_typee.
    DATA albums TYPE STANDARD TABLE OF albums_typee WITH KEY artist_id.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("DATA, ok sub field", () => {
    const abap = `
TYPES: BEGIN OF albums_typee,
         artist_id TYPE string,
         BEGIN OF sub,
           field TYPE i,
         END OF sub,
       END OF albums_typee.
DATA albums TYPE STANDARD TABLE OF albums_typee WITH KEY sub-field.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("key ok, its table_line", () => {
    const abap = `
    TYPES:
      BEGIN OF ty_issue,
        message  TYPE string,
        key      TYPE string,
        filename TYPE string,
        severity TYPE string,
      END OF ty_issue.
    TYPES:
      ty_issues TYPE STANDARD TABLE OF ty_issue WITH KEY table_line.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("escaped key field name", () => {
    const abap = `
TYPES: BEGIN OF name_value,
         name  TYPE string,
         value TYPE string,
       END OF name_value.
TYPES tab TYPE STANDARD TABLE OF name_value WITH NON-UNIQUE KEY !name.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("WITH many", () => {
    const abap = `
TYPES: BEGIN OF foo_bar,
         foo TYPE string,
         bar TYPE string,
       END OF foo_bar.

TYPES moo
  TYPE SORTED TABLE OF foo_bar
  WITH NON-UNIQUE KEY foo
  WITH UNIQUE SORTED KEY key_name COMPONENTS bar foo
  INITIAL SIZE 2.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("Sequence of stuff in intf/clas sections", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES foo TYPE i.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

INTERFACE lif.
  DATA ref TYPE REF TO lcl.
  TYPES blah TYPE ref->foo.
ENDINTERFACE.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("type via reference, var defined in super", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES foo TYPE i.
    DATA ref TYPE REF TO lcl.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

CLASS sub DEFINITION INHERITING FROM lcl.
  PUBLIC SECTION.
    DATA moo TYPE ref->foo.
ENDCLASS.
CLASS sub IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("type via reference, var defined in super, structured", () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF foo,
             field TYPE i,
           END OF foo.
    DATA ref TYPE REF TO lcl.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

CLASS sub DEFINITION INHERITING FROM lcl.
  PUBLIC SECTION.
    DATA moo TYPE ref->foo-field.
ENDCLASS.
CLASS sub IMPLEMENTATION.
ENDCLASS.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("function module parameters", () => {
    const file1 = `FUNCTION-POOL ZFUGR0.`;
    const file2 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>LZFUGR0TOP</NAME>
    <DBAPL>S</DBAPL>
    <DBNA>D$</DBNA>
    <SUBC>I</SUBC>
    <APPL>S</APPL>
    <FIXPT>X</FIXPT>
    <LDBNAME>D$S</LDBNAME>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const file3 = `
    INCLUDE LZFUGR0TOP.
    INCLUDE LZFUGR0UXX.`;
    const file4 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>SAPLZFUGR0</NAME>
    <DBAPL>S</DBAPL>
    <DBNA>D$</DBNA>
    <SUBC>F</SUBC>
    <APPL>S</APPL>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <LDBNAME>D$S</LDBNAME>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const file5 = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AREAT>test</AREAT>
   <INCLUDES>
    <SOBJ_NAME>LZFUGR0TOP</SOBJ_NAME>
    <SOBJ_NAME>SAPLZFUGR0</SOBJ_NAME>
   </INCLUDES>
   <FUNCTIONS>
    <item>
     <FUNCNAME>ZFOOBAR</FUNCNAME>
     <SHORT_TEXT>test</SHORT_TEXT>
     <IMPORT>
      <RSIMP>
       <PARAMETER>INPUT1</PARAMETER>
       <TYP>SY-DATUM</TYP>
      </RSIMP>
      <RSIMP>
       <PARAMETER>INPUT2</PARAMETER>
       <TYP>ABAP_BOOL</TYP>
      </RSIMP>
      <RSIMP>
       <PARAMETER>INPUT3</PARAMETER>
       <TYP>I</TYP>
      </RSIMP>
      <RSIMP>
       <PARAMETER>INPUT4</PARAMETER>
       <TYP>ABAP_ENCODING</TYP>
      </RSIMP>
     </IMPORT>
     <DOCUMENTATION>
      <RSFDO>
       <PARAMETER>INPUT1</PARAMETER>
       <KIND>P</KIND>
      </RSFDO>
      <RSFDO>
       <PARAMETER>INPUT2</PARAMETER>
       <KIND>P</KIND>
      </RSFDO>
      <RSFDO>
       <PARAMETER>INPUT3</PARAMETER>
       <KIND>P</KIND>
      </RSFDO>
      <RSFDO>
       <PARAMETER>INPUT4</PARAMETER>
       <KIND>P</KIND>
      </RSFDO>
     </DOCUMENTATION>
    </item>
   </FUNCTIONS>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const file6 = `FUNCTION zfoobar.
*"----------------------------------------------------------------------
*"*"Local Interface:
*"  IMPORTING
*"     VALUE(INPUT1) TYPE  SY-DATUM
*"     VALUE(INPUT2) TYPE  ABAP_BOOL
*"     VALUE(INPUT3) TYPE  I
*"----------------------------------------------------------------------

ENDFUNCTION.`;

    const typepool = `TYPE-POOL abap.
    TYPES abap_encoding TYPE c LENGTH 20.`;

    let issues = runMulti([
      {filename: "zfugr0.fugr.lzfugr0top.abap", contents: file1},
      {filename: "zfugr0.fugr.lzfugr0top.xml", contents: file2},
      {filename: "zfugr0.fugr.saplzfugr0.abap", contents: file3},
      {filename: "zfugr0.fugr.saplzfugr0.xml", contents: file4},
      {filename: "zfugr0.fugr.xml", contents: file5},
      {filename: "zfugr0.fugr.zfoobar.abap", contents: file6},
      {filename: "abap.type.abap", contents: typepool},
    ], fullErrorNamespace());
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

  it("type table, ddls typed", () => {
    const abap = `DATA foo TYPE STANDARD TABLE OF /foo/i_bar WITH EMPTY KEY.`;
    const ddls = `define root view entity /foo/i_bar
as select from zsdfsd
{
key mat      as Mat,
    comment   as comment
}`;

    let issues = runMulti([
      {filename: "zfoobar.prog.abap", contents: abap},
      {filename: "#foo#i_bar.ddls.asddls", contents: ddls},
    ], fullErrorNamespace());
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(0);
  });

});