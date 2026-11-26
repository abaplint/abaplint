import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";
import {IRegistry} from "../../../src/_iregistry";

describe("Rename URLs", () => {

  const sicf = `\ufeff<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SICF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/sap/bc/zfoo/</URL>
   <ICFSERVICE>
    <ICF_NAME>ZFOO</ICF_NAME>
    <ORIG_NAME>zfoo</ORIG_NAME>
   </ICFSERVICE>
  </asx:values>
 </asx:abap>
</abapGit>`;

  const wapa = `\ufeff<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_WAPA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <ATTRIBUTES>
    <APPLNAME>ZAPP</APPLNAME>
    <APPLEXT>ZAPP</APPLEXT>
    <TEXT>runs on /sap/bc/zfoo</TEXT>
   </ATTRIBUTES>
   <PAGES>
    <item>
     <ATTRIBUTES>
      <APPLNAME>ZAPP</APPLNAME>
      <PAGEKEY>MANIFEST.JSON</PAGEKEY>
      <PAGENAME>manifest.json</PAGENAME>
     </ATTRIBUTES>
    </item>
   </PAGES>
  </asx:values>
 </asx:abap>
</abapGit>`;

  const manifest = `{
  "uri": "/sap/bc/zfoo",
  "slash": "/sap/bc/zfoo/",
  "query": "/sap/bc/ZFOO?x=1",
  "absolute": "https://host/sap/bc/zfoo/start",
  "other": "/sap/bc/zfoo_cci/",
  "longer": "/sap/bc/zfoobar"
}`;

  function registry(): IRegistry {
    return new Registry().addFiles([
      new MemoryFile("zfoo           0e8aa5bbbb68f6118b9cd7023.sicf.xml", sicf),
      new MemoryFile("zapp.wapa.xml", wapa),
      new MemoryFile("zapp.wapa.manifest.json", manifest),
    ]).parse();
  }

  it("the URL of the renamed ICF node in a page of a BSP", () => {
    const reg = registry();
    const renamer = new Renamer(reg);
    renamer.rename("SICF", "zfoo", "/ns/foo");
    const result = renamer.renameURLs();

    const raw = reg.getFileByName("zapp.wapa.manifest.json")!.getRaw();
    expect(raw).to.include(`"uri": "/sap/bc/ns/foo"`);
    expect(raw).to.include(`"slash": "/sap/bc/ns/foo/"`);
    expect(raw).to.include(`"query": "/sap/bc/ns/foo?x=1"`);
    expect(raw).to.include(`"absolute": "https://host/sap/bc/ns/foo/start"`);
    // another node, a longer name
    expect(raw).to.include(`"other": "/sap/bc/zfoo_cci/"`);
    expect(raw).to.include(`"longer": "/sap/bc/zfoobar"`);
    expect(result.updatedFiles.has("zapp.wapa.manifest.json")).to.equal(true);

    // the XML of the application is not a page
    expect(reg.getFileByName("zapp.wapa.xml")!.getRaw()).to.include("<TEXT>runs on /sap/bc/zfoo</TEXT>");
  });

  it("without a namespace", () => {
    const reg = registry();
    const renamer = new Renamer(reg);
    renamer.rename("SICF", "zfoo", "zbar");
    renamer.renameURLs();
    expect(reg.getFileByName("zapp.wapa.manifest.json")!.getRaw()).to.include(`"uri": "/sap/bc/zbar"`);
  });

  it("only with renameURLs", () => {
    const reg = registry();
    new Renamer(reg).rename("SICF", "zfoo", "/ns/foo");
    expect(reg.getFileByName("zapp.wapa.manifest.json")!.getRaw()).to.equal(manifest);
  });

  it("nothing renamed", () => {
    const reg = registry();
    const result = new Renamer(reg).renameURLs();
    expect(result.updatedFiles.size).to.equal(0);
    expect(reg.getFileByName("zapp.wapa.manifest.json")!.getRaw()).to.equal(manifest);
  });
});
