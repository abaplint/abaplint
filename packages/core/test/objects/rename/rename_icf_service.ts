import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename SICF", () => {

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SICF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/sap/bc/z2ui5_local/</URL>
   <ICFSERVICE>
    <ICF_NAME>Z2UI5_LOCAL</ICF_NAME>
    <HTTPCDE500>2</HTTPCDE500>
    <HTTPCDE401>2</HTTPCDE401>
    <HTTPCDELPAG>2</HTTPCDELPAG>
    <HTTPCDENFPAG>2</HTTPCDENFPAG>
    <ORIG_NAME>z2ui5_local</ORIG_NAME>
   </ICFSERVICE>
   <ICFDOCU>
    <ICF_NAME>Z2UI5_LOCAL</ICF_NAME>
    <ICF_LANGU>E</ICF_LANGU>
    <ICF_DOCU>abap2UI5 local</ICF_DOCU>
   </ICFDOCU>
   <ICFHANDLER_TABLE>
    <ICFHANDLER>
     <ICF_NAME>Z2UI5_LOCAL</ICF_NAME>
     <ICFORDER>01</ICFORDER>
     <ICFTYP>A</ICFTYP>
     <ICFHANDLER>Z2UI5_CL_ABAP2UI5_LOCAL</ICFHANDLER>
    </ICFHANDLER>
   </ICFHANDLER_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("SICF", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("z2ui5_local 9def6c78d0beedf8d5b04ba6c.sicf.xml", xml),
    ]).parse();
    new Renamer(reg).rename("SICF", "z2ui5_local", "foo");
    expect(reg.getObjectCount().normal).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo 9def6c78d0beedf8d5b04ba6c.sicf.xml");
      expect(f.getRaw().includes("<URL>/sap/bc/foo/</URL>")).to.equal(true);
      expect(f.getRaw().includes("<ICF_NAME>FOO</ICF_NAME>")).to.equal(true);
      expect(f.getRaw().includes("<ORIG_NAME>foo</ORIG_NAME>")).to.equal(true);
    }
  });
});