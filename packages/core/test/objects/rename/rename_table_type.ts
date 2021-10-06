import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename TTYP", () => {

  it("TTYP, no references, just the object", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TTYP" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD40V>
    <TYPENAME>ZAG_UNIT_TEST_TT</TYPENAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <ROWTYPE>TADIR</ROWTYPE>
    <ROWKIND>S</ROWKIND>
    <DATATYPE>STRU</DATATYPE>
    <ACCESSMODE>T</ACCESSMODE>
    <KEYDEF>D</KEYDEF>
    <KEYKIND>N</KEYKIND>
    <DDTEXT>unit test</DDTEXT>
   </DD40V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zag_unit_test_tt.ttyp.xml", xml),
    ]).parse();

    new Renamer(reg).rename("TTYP", "zag_unit_test_tt", "foo");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo.ttyp.xml");
      expect(f.getRaw().includes("<TYPENAME>FOO</TYPENAME>")).to.equal(true);
    }
  });

});