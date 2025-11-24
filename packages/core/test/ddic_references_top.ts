import {expect} from "chai";
import {MemoryFile, Registry} from "../src";

describe("DDIC References, top via registry", () => {

  it("test 1", async () => {
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

    await reg.findIssues();

    const ref = reg.getDDICReferences();
    const prog = reg.getFirstObject();
    expect(ref.listUsing(prog!).length).to.equal(1);
  });

});
