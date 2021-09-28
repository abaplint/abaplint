import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename Domain", () => {

  it("DOMA, no references, just the object", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD01V>
    <DOMNAME>ZBAR</DOMNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000010</LENG>
    <OUTPUTLEN>000010</OUTPUTLEN>
    <DDTEXT>Testing</DDTEXT>
   </DD01V>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFiles([
      new MemoryFile("zbar.doma.xml", xml),
    ]).parse();

    new Renamer(reg).rename("DOMA", "zbar", "foo");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo.doma.xml");
      expect(f.getRaw().includes("<DOMNAME>FOO</DOMNAME>")).to.equal(true);
    }
  });

});