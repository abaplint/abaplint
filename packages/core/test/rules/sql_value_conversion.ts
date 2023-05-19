import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {EasyToFindMessages} from "../../src/rules";
import {expect} from "chai";
import {Issue} from "../../src/issue";

export const tabl_t100xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>T100</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <DDTEXT>Messages</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>T100</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <UEBERSETZ>N</UEBERSETZ>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>T100</TABNAME>
     <FIELDNAME>SPRSL</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0001</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000002</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>LANG</DATATYPE>
     <LENG>000001</LENG>
     <MASK>  LANG</MASK>
     <LANGUFLAG>X</LANGUFLAG>
    </DD03P>
    <DD03P>
     <TABNAME>T100</TABNAME>
     <FIELDNAME>ARBGB</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0002</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000040</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000020</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>T100</TABNAME>
     <FIELDNAME>MSGNR</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0003</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000006</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000003</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>T100</TABNAME>
     <FIELDNAME>TEXT</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0004</POSITION>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000146</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000073</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

async function run(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry();
  reg.addFile(new MemoryFile("t100.tabl.xml", tabl_t100xml));
  reg.addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  return new EasyToFindMessages().initialize(reg).run(reg.getFirstObject()!);
}

describe.only("Rule sql_value_conversion", () => {

  it("parser error", async () => {
    const abap = "sfsdfd";
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("conversion", async () => {
    const abap = `
    DATA ls_result TYPE t100.
    SELECT SINGLE * FROM t100 INTO ls_result WHERE arbgb = 'ZAG_UNIT_TEST' AND msgnr = 123.`;
    const issues = await run(abap);
    expect(issues.length).to.equals(1);
  });

  it("fixed", async () => {
    const abap = `
    DATA ls_result TYPE t100.
    SELECT SINGLE * FROM t100 INTO ls_result WHERE arbgb = 'ZAG_UNIT_TEST' AND msgnr = '123'.`;
    const issues = await run(abap);
    expect(issues.length).to.equals(0);
  });

});