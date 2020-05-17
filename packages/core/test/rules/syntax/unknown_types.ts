import {runMulti, testRule} from "../_utils";
import {UnknownTypes} from "../../../src/rules";
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


describe("unknown_types Rule, Multiple files", () => {

  it("TABL, error", () => {
    const abap = `
REPORT zfoobar.
DATA ls_tadir TYPE ztadir.`;
    let issues = runMulti([{filename: "zfoobar.prog.abap", contents: abap}]);
    issues = issues.filter(i => i.getKey() === key);
    expect(issues.length).to.equal(1);
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

  it.skip("swag typing", () => {
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
    console.dir(issues);  //////////////////////////////////////////////////////
    expect(issues.length).to.equal(0);
  });

});