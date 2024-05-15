import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Transaction} from "../../src/objects";

describe("Transaction, parse XML", () => {
  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TRAN" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TSTC>
    <TCODE>ZTRANSACTION_REPORT</TCODE>
    <PGMNA>ZTRANSACTION_REPORT</PGMNA>
    <DYPNO>1000</DYPNO>
    <CINFO>gA==</CINFO>
   </TSTC>
   <TSTCC>
    <TCODE>ZTRANSACTION_REPORT</TCODE>
    <S_WEBGUI>1</S_WEBGUI>
    <S_WIN32>X</S_WIN32>
    <S_PLATIN>X</S_PLATIN>
   </TSTCC>
   <TSTCT>
    <SPRSL>E</SPRSL>
    <TCODE>ZTRANSACTION_REPORT</TCODE>
    <TTEXT>report transaction change</TTEXT>
   </TSTCT>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ztransaction_report.tran.xml", xml));
    await reg.parseAsync();
    const tran = reg.getFirstObject()! as Transaction;

    expect(tran.getDescription()).to.equal("report transaction change");
    expect(tran.getProgramName()).to.equal("ZTRANSACTION_REPORT");
  });

});