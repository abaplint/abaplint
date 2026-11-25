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
      // abapGit layout: name padded to 15, then the SHA1 of the new URL "/sap/bc/foo/"
      expect(f.getFilename()).to.equal("foo            038033a7439955ca869c17ab2.sicf.xml");
      expect(f.getRaw().includes("<URL>/sap/bc/foo/</URL>")).to.equal(true);
      expect(f.getRaw().includes("<ICF_NAME>FOO</ICF_NAME>")).to.equal(true);
      expect(f.getRaw().includes("<ORIG_NAME>foo</ORIG_NAME>")).to.equal(true);
    }
  });

  it("SICF, abapGit file name in a folder", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("src/http/z2ui5_local    72b72fad1445b8e2c5cfeee10.sicf.xml", xml),
    ]).parse();
    new Renamer(reg).rename("SICF", "z2ui5_local", "zbar_local");
    expect(reg.getObjectCount().normal).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("src/http/zbar_local     ced3c73ab88b991d8760e1d89.sicf.xml");
      expect(f.getRaw().includes("<URL>/sap/bc/zbar_local/</URL>")).to.equal(true);
    }
  });

  it("SICF, file name not in the abapGit layout", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("z2ui5_local.sicf.xml", xml),
    ]).parse();
    new Renamer(reg).rename("SICF", "z2ui5_local", "foo");
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo.sicf.xml");
    }
  });
});
