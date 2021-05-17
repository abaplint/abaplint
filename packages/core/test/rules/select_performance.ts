import {MemoryFile} from "../../src/files/memory_file";
import {IFile} from "../../src/files/_ifile";
import {Issue} from "../../src/issue";
import {Registry} from "../../src/registry";
import {SelectPerformance} from "../../src/rules";
import {testRule} from "./_utils";
import {expect} from "chai";

const tests = [

  // endselect
  {abap: `SELECT bar from mara INTO @foobar.
  ENDSELECT.`, cnt: 1},
  {abap: `SELECT bar from mara INTO TABLE @<lt_mara> PACKAGE SIZE @lv_pack.
  ENDSELECT.`, cnt: 0},

  // select star
  {abap: `SELECT * from mara INTO table @data(foobar).`, cnt: 1},
  {abap: `SELECT * FROM mara. ENDSELECT.`, cnt: 2}, // both endselect and select *
  {abap: `SELECT foo, bar from mara INTO table @data(foobar).`, cnt: 0},
  {abap: `SELECT * from mara INTO corresponding fields of table @foobar.`, cnt: 0},
  {abap: `SELECT * FROM sdfsd APPENDING CORRESPONDING FIELDS OF TABLE @sdfsd-sdfsd
    WHERE sdfsd = @lv_sdf
    AND sss <> ' '.`, cnt: 0},
  {abap: `SELECT * FROM tab INTO @DATA(ls_tab) WHERE field = @l_var ORDER BY blah.
    ENDSELECT.`, cnt: 2}, // both endselect and select *
  {abap:`SELECT SINGLE * FROM sdfds INTO @sdfsd WHERE sdfdsss = @sdfaasd.`, cnt: 1},
];

testRule(tests, SelectPerformance);


async function findIssues(files: IFile[]): Promise<readonly Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  let issues = reg.findIssues();
  const key = new SelectPerformance().getMetadata().key;
  issues = issues.filter(i => i.getKey() === key);
  return issues;
}

describe("Rule: select_performance", () => {

  it("Check number of columns", async () => {

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

    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs).`;
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);
    const file = new MemoryFile("zfoo.prog.abap", abap);

    const issues = await findIssues([tabl, file]);
    expect(issues.length).to.equal(0);
  });

});