import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename MSAG", () => {

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_MSAG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <T100A>
    <ARBGB>ZAG_UNIT_TEST</ARBGB>
    <MASTERLANG>E</MASTERLANG>
    <STEXT>test</STEXT>
   </T100A>
   <T100>
    <T100>
     <SPRSL>E</SPRSL>
     <ARBGB>ZAG_UNIT_TEST</ARBGB>
     <MSGNR>000</MSGNR>
     <TEXT>hello world</TEXT>
    </T100>
   </T100>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("MSAG, no references, just the object", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zag_unit_test.msag.xml", xml),
    ]).parse();
    new Renamer(reg).rename("MSAG", "zag_unit_test", "foo");
    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo.msag.xml");
      expect(f.getRaw().includes("<ARBGB>FOO</ARBGB>")).to.equal(true);
    }
  });

  it("MSAG, with some abap", () => {
    const abap = `MESSAGE e000(zag_unit_test).`;
    const reg = new Registry().addFiles([
      new MemoryFile("zag_unit_test.msag.xml", xml),
      new MemoryFile("zreport.prog.abap", abap),
    ]).parse();

    reg.findIssues(); // hmm, this builds the references

    new Renamer(reg).rename("MSAG", "zag_unit_test", "foo");

    const prog = reg.getObject("PROG", "ZREPORT");
    const file = prog?.getFiles()[0];
    expect(file?.getRaw()).to.equal(`MESSAGE e000(foo).`);
  });

});