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

const keys = `
TYPES: BEGIN OF ty_key,
         name TYPE c LENGTH 30,
       END OF ty_key.
DATA lt_keys TYPE STANDARD TABLE OF ty_key WITH EMPTY KEY.`;

function run(code: string) {
  return runMulti([
    {filename: "ztab.tabl.xml", contents: tabl},
    {filename: "zfoo.prog.abap", contents: keys + "\n" + code}]);
}

describe("syntax.ts, FOR ALL ENTRIES and ORDER BY, #3131", () => {

  it("ORDER BY a field list, error", () => {
    const issues = run(`SELECT name, value FROM ztab FOR ALL ENTRIES IN @lt_keys
  WHERE name = @lt_keys-name ORDER BY value INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equals("FOR ALL ENTRIES: only ORDER BY PRIMARY KEY is allowed");
  });

  it("ORDER BY a field list, INTO first, error", () => {
    const issues = run(`DATA lt_res TYPE STANDARD TABLE OF ztab WITH EMPTY KEY.
SELECT name value FROM ztab INTO CORRESPONDING FIELDS OF TABLE lt_res FOR ALL ENTRIES IN lt_keys
  WHERE name = lt_keys-name ORDER BY name.`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.equals("FOR ALL ENTRIES: only ORDER BY PRIMARY KEY is allowed");
  });

  it("ORDER BY PRIMARY KEY, all fields, ok", () => {
    const issues = run(`SELECT * FROM ztab FOR ALL ENTRIES IN @lt_keys
  WHERE name = @lt_keys-name ORDER BY PRIMARY KEY INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(0, issues[0]?.getMessage());
  });

  it("ORDER BY PRIMARY KEY, key in the field list, client left out, ok", () => {
    const issues = run(`SELECT name, value FROM ztab FOR ALL ENTRIES IN @lt_keys
  WHERE name = @lt_keys-name ORDER BY PRIMARY KEY INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(0, issues[0]?.getMessage());
  });

  it("ORDER BY PRIMARY KEY, key missing in the field list, error", () => {
    const issues = run(`SELECT value FROM ztab FOR ALL ENTRIES IN @lt_keys
  WHERE name = @lt_keys-name ORDER BY PRIMARY KEY INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(1);
    expect(issues[0].getMessage()).to.contain("missing name");
  });

  it("ORDER BY a field list without FOR ALL ENTRIES, ok", () => {
    const issues = run(`SELECT name, value FROM ztab WHERE name = 'A' ORDER BY value INTO TABLE @DATA(lt_res).`);
    expect(issues.length).to.equals(0, issues[0]?.getMessage());
  });

  it("ORDER BY PRIMARY KEY, unknown table, no issue from this check", () => {
    const issues = runMulti([{filename: "zfoo.prog.abap", contents: keys + `
SELECT value FROM zunknown FOR ALL ENTRIES IN @lt_keys
  WHERE name = @lt_keys-name ORDER BY PRIMARY KEY INTO TABLE @DATA(lt_res).`}]);
    expect(issues.filter(i => i.getMessage().includes("FOR ALL ENTRIES")).length).to.equals(0);
  });

});
