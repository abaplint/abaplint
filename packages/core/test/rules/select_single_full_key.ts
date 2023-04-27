import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {SelectSingleFullKey} from "../../src/rules";
import {IFile} from "../../src";

const ztab = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTAB</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <DDTEXT>transparent table</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
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
     <TABNAME>ZTAB</TABNAME>
     <FIELDNAME>FIELD1</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0001</POSITION>
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
     <TABNAME>ZTAB</TABNAME>
     <FIELDNAME>VALUE1</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0002</POSITION>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>X</INTTYPE>
     <INTLEN>000004</INTLEN>
     <DATATYPE>INT4</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  INT4</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

const zmandttab = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZMANDTTAB</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>test</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZMANDTTAB</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

async function findIssues(files: IFile[]): Promise<readonly Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  return new SelectSingleFullKey().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: select_single_full_key", () => {

  it("test 1", async () => {
    const abap = "parser error";
    const issues = await findIssues([new MemoryFile("sfkey.prog.abap", abap)]);
    expect(issues.length).to.equal(0);
  });

  it("test 2", async () => {
    const abap = `DATA foo TYPE i.`;
    const issues = await findIssues([new MemoryFile("sfkey.prog.abap", abap)]);
    expect(issues.length).to.equal(0);
  });

  it("err", async () => {
    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs).`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(1);
  });

  it("fixed", async () => {
    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs) WHERE field1 = 'A'.`;
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);
    const file = new MemoryFile("zfoo.prog.abap", abap);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(0);
  });

  it("suppresed by pseudo", async () => {
    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs). "#EC CI_NOORDER`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(0);
  });

  it("fixed, ignore MANDT field", async () => {
    const abap = `SELECT SINGLE * FROM zmandttab INTO @DATA(sdfs) WHERE field1 = 'A'.`;
    const tabl = new MemoryFile("zmandttab.tabl.xml", zmandttab);
    const file = new MemoryFile("zfoo.prog.abap", abap);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(0);
  });

});