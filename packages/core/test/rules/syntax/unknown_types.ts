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

});