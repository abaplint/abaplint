import {expect} from "chai";
import {MemoryFile, Registry} from "../src";

describe("DDIC References, top via registry", () => {

  it("prog referencing dtel", async () => {
    const reg = new Registry();

    reg.addFile(new MemoryFile("prog1.prog.abap", `
      PROGRAM prog1.
      DATA foo TYPE zagt_test_dtel.
    `));

    reg.addFile(new MemoryFile("zagt_test_dtel.dtel.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZAGT_TEST_DTEL</ROLLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <HEADLEN>55</HEADLEN>
    <SCRLEN1>10</SCRLEN1>
    <SCRLEN2>20</SCRLEN2>
    <SCRLEN3>40</SCRLEN3>
    <DDTEXT>testing</DDTEXT>
    <REPTEXT>testing</REPTEXT>
    <SCRTEXT_S>testing</SCRTEXT_S>
    <SCRTEXT_M>testing</SCRTEXT_M>
    <SCRTEXT_L>testing</SCRTEXT_L>
    <DTELMASTER>E</DTELMASTER>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000001</LENG>
    <OUTPUTLEN>000001</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`));

    reg.findIssues();

    const ref = reg.getDDICReferences();
    const prog = reg.getFirstObject();
    expect(ref.listUsing(prog!).length).to.equal(1);
  });

  it.only("prog referencing tabl with like, and its unknown", async () => {
    const reg = new Registry();

    reg.addFile(new MemoryFile("zprog1.prog.abap", `REPORT ZPROG1.
DATA: BEGIN OF ztab OCCURS 0,
        moo LIKE ztabl-XUBNAME,
      END OF ztab.`));

    reg.addFile(new MemoryFile("ztabl.tabl.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTABL</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>testing</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZTABL</TABNAME>
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
     <FIELDNAME>XUBNAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>NAME</FIELDNAME>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`));

    console.dir(reg.findIssues());

    const ref = reg.getDDICReferences();
    const prog = reg.getFirstObject();
    expect(ref.listUsing(prog!).length).to.equal(1);
  });

});
