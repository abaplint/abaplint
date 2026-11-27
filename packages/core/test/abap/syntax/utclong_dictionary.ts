import {expect} from "chai";
import {runMulti} from "./syntax";
import * as Basic from "../../../src/abap/types/basic";
import {MemoryFile} from "../../../src/files/memory_file";
import {Registry} from "../../../src/registry";
import {DataElement} from "../../../src/objects";

function dataElement(datatype: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZUTCL</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>${datatype}</DATATYPE>
    <LENG>000027</LENG>
    <OUTPUTLEN>000030</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
}

const table = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTAB</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>KEYF</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
    </DD03P>
    <DD03P>
     <FIELDNAME>TS</FIELDNAME>
     <ROLLNAME>ZUTCL</ROLLNAME>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>TS2</FIELDNAME>
     <DATATYPE>UTCL</DATATYPE>
     <LENG>000027</LENG>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

function run(abap: string): string[] {
  return runMulti([
    {filename: "zutcl.dtel.xml", contents: dataElement("UTCL")},
    {filename: "ztab.tabl.xml", contents: table},
    {filename: "zfoobar.prog.abap", contents: abap},
  ]).map(i => i.getMessage());
}

describe("syntax.ts, dictionary type utclong", () => {
  const program = (code: string): string => `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS take_u IMPORTING val TYPE utclong.
    CLASS-METHODS take_z IMPORTING val TYPE zutcl.
    CLASS-METHODS take_clike IMPORTING val TYPE clike.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD take_u.
  ENDMETHOD.
  METHOD take_z.
  ENDMETHOD.
  METHOD take_clike.
  ENDMETHOD.
ENDCLASS.
TYPES ty_c TYPE c LENGTH 27.
DATA z TYPE zutcl.
DATA u TYPE utclong.
DATA i TYPE i.
DATA d TYPE d.
DATA t TYPE t.
DATA c TYPE ty_c.
DATA s TYPE string.
DATA row TYPE ztab.
FIELD-SYMBOLS <u> TYPE utclong.
${code}`;

  const errors: string[] = [
    `i = z + 1.`,
    `s = z+1(1).`,
    `i = z.`,
    `z = i.`,
    `d = z.`,
    `i = strlen( z ).`,
    `CONCATENATE z \`a\` INTO s.`,
    `DATA(x) = z. i = x + 1.`,
    `ADD 1 TO z.`,
    `i = row-ts + 1.`,
    `i = row-ts2 + 1.`,
    `lcl=>take_clike( z ).`,
    `GET TIME STAMP FIELD z.`,
    `GET TIME STAMP FIELD u.`,
  ];

  for (const abap of errors) {
    it("error: " + abap, () => {
      expect(run(program(abap)).length).to.equal(1);
    });
  }

  const ok: string[] = [
    `u = z.`,
    `z = u.`,
    `s = z.`,
    `c = z.`,
    `z = c.`,
    `z = s.`,
    `row-ts = row-ts2.`,
    `z = utclong_add( val = z seconds = 1 ).`,
    `ASSIGN z TO <u>.`,
    `lcl=>take_u( z ).`,
    `lcl=>take_z( u ).`,
    `lcl=>take_u( row-ts ).`,
    `s = |{ z }|.`,
    `WRITE z.`,
    `CONVERT UTCLONG z TIME ZONE 'UTC' INTO DATE d TIME t.`,
    `CONVERT DATE d TIME t TIME ZONE 'UTC' INTO UTCLONG z.`,
    `SELECT SINGLE * FROM ztab INTO @row WHERE ts = @z.`,
  ];

  for (const abap of ok) {
    it("ok: " + abap, () => {
      expect(run(program(abap))).to.deep.equal([]);
    });
  }

  for (const datatype of ["UTCL", "UTCLONG"]) {
    it("typed as utclong, " + datatype, () => {
      const reg = new Registry().addFile(new MemoryFile("zutcl.dtel.xml", dataElement(datatype))).parse();
      const type = (reg.getObject("DTEL", "ZUTCL") as DataElement).parseType(reg);
      expect(type).to.be.instanceof(Basic.UTCLongType);
      expect(type.getQualifiedName()).to.equal("ZUTCL");
    });
  }
});
