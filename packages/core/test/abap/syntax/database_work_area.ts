import {expect} from "chai";
import {runMulti} from "./syntax";

const tabl = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTAB</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>settings</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZTAB</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000006</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CLNT</DATATYPE>
     <LENG>000003</LENG>
     <MASK>  CLNT</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>NAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000060</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000030</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>VALUE</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000510</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000255</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

const short = `
TYPES: BEGIN OF ty_row,
         name  TYPE c LENGTH 30,
         value TYPE c LENGTH 255,
       END OF ty_row.
DATA ls_row TYPE ty_row.
DATA lt_row TYPE STANDARD TABLE OF ty_row WITH EMPTY KEY.`;

function run(code: string) {
  return runMulti([
    {filename: "ztab.tabl.xml", contents: tabl},
    {filename: "zfoo.prog.abap", contents: code}]);
}

describe("syntax.ts, database work area shorter than the table line", () => {

  it("MODIFY dbtab FROM wa without the client field", () => {
    const issues = run(short + `\nMODIFY ztab FROM @ls_row.`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("not long enough");
  });

  it("INSERT dbtab FROM wa without the client field", () => {
    const issues = run(short + `\nINSERT ztab FROM @ls_row.`);
    expect(issues.length).to.equals(1);
  });

  it("UPDATE dbtab FROM wa without the client field", () => {
    const issues = run(short + `\nUPDATE ztab FROM @ls_row.`);
    expect(issues.length).to.equals(1);
  });

  it("old syntax, no escape", () => {
    const issues = run(short + `\nMODIFY ztab FROM ls_row.`);
    expect(issues.length).to.equals(1);
  });

  it("work area typed as the table", () => {
    const issues = run(`DATA ls_row TYPE ztab.
MODIFY ztab FROM @ls_row.
INSERT ztab FROM @ls_row.
UPDATE ztab FROM @ls_row.`);
    expect(issues.length).to.equals(0);
  });

  it("VALUE of the table type", () => {
    const issues = run(`DATA(ls_row) = VALUE ztab( name = 'A' value = 'B' ).
MODIFY ztab FROM @ls_row.`);
    expect(issues.length).to.equals(0);
  });

  it("work area longer than the line", () => {
    const issues = run(`TYPES: BEGIN OF ty_row,
         mandt TYPE c LENGTH 3,
         name  TYPE c LENGTH 30,
         value TYPE c LENGTH 255,
         extra TYPE c LENGTH 10,
       END OF ty_row.
DATA ls_row TYPE ty_row.
MODIFY ztab FROM @ls_row.`);
    expect(issues.length).to.equals(0);
  });

  it("FROM TABLE is not a work area", () => {
    const issues = run(short + `\nINSERT ztab FROM TABLE @lt_row.`);
    expect(issues.length).to.equals(0);
  });

  it("MODIFY of an internal table", () => {
    const issues = run(`TYPES: BEGIN OF ty_row,
         name TYPE c LENGTH 1,
       END OF ty_row.
DATA ztab TYPE STANDARD TABLE OF ty_row WITH EMPTY KEY.
DATA ls_row TYPE ty_row.
MODIFY ztab FROM ls_row INDEX 1.`);
    expect(issues.length).to.equals(0);
  });

  it("deep work area is not measured", () => {
    const issues = run(`TYPES: BEGIN OF ty_row,
         name  TYPE string,
       END OF ty_row.
DATA ls_row TYPE ty_row.
MODIFY ztab FROM @ls_row.`);
    expect(issues.length).to.equals(0);
  });

});
