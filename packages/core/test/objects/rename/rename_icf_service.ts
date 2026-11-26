import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";
import {IRegistry} from "../../../src/_iregistry";
import {namespacedURL} from "../../../src/objects/rename/rename_icf_service";

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

  function sicf(url: string, name: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SICF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>${url}</URL>
   <ICFSERVICE>
    <ICF_NAME>${name.toUpperCase()}</ICF_NAME>
    <ORIG_NAME>${name.toLowerCase()}</ORIG_NAME>
   </ICFSERVICE>
   <ICFDOCU>
    <ICF_NAME>${name.toUpperCase()}</ICF_NAME>
    <ICF_LANGU>E</ICF_LANGU>
    <ICF_DOCU>service</ICF_DOCU>
   </ICFDOCU>
  </asx:values>
 </asx:abap>
</abapGit>`;
  }

  function fileOf(reg: IRegistry, name: string) {
    return Array.from(reg.getFiles()).find(f => f.getFilename().endsWith(name));
  }

  it("SICF, into a namespace", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zfoo           0e8aa5bbbb68f6118b9cd7023.sicf.xml", sicf("/sap/bc/zfoo/", "zfoo")),
    ]).parse();
    new Renamer(reg).rename("SICF", "zfoo", "/ns/foo");
    expect(reg.getObjectCount().normal).to.equal(2);
    const f = fileOf(reg, "foo            f0053e93956e7d6d0f315b74c.sicf.xml");
    expect(f).to.not.equal(undefined);
    expect(f!.getRaw().includes("<URL>/sap/bc/ns/foo/</URL>")).to.equal(true);
    expect(f!.getRaw().includes("<ICF_NAME>FOO</ICF_NAME>")).to.equal(true);
    expect(f!.getRaw().includes("<ORIG_NAME>foo</ORIG_NAME>")).to.equal(true);
    expect(f!.getRaw().includes("<ICF_NAME>ZFOO</ICF_NAME>")).to.equal(false);
  });

  it("SICF, BSP node into a namespace", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zfoo           efe121c45a2e775419571ac3f.sicf.xml", sicf("/sap/bc/bsp/sap/zfoo/", "zfoo")),
    ]).parse();
    new Renamer(reg).rename("SICF", "zfoo", "/NS/FOO");
    const f = fileOf(reg, "foo            4cf4929f5fad5e43f83f15088.sicf.xml");
    expect(f!.getRaw().includes("<URL>/sap/bc/bsp/ns/foo/</URL>")).to.equal(true);
    const parent = fileOf(reg, "ns             b6d7f046fde2a34538f5372cc.sicf.xml");
    expect(parent!.getRaw().includes("<URL>/sap/bc/bsp/ns/</URL>")).to.equal(true);
  });

  it("SICF, into a namespace, the node of the namespace is created", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("src/zfoo           0e8aa5bbbb68f6118b9cd7023.sicf.xml", sicf("/sap/bc/zfoo/", "zfoo")),
    ]).parse();
    const result = new Renamer(reg).rename("SICF", "zfoo", "/ns/foo");
    const name = "src/ns             cb988e6036206c8d542135ca1.sicf.xml";
    expect(result.addedFiles.has(name)).to.equal(true);
    expect(result.updatedFiles.has(name)).to.equal(false);
    const parent = reg.getFileByName(name);
    expect(parent!.getRaw().includes("<URL>/sap/bc/ns/</URL>")).to.equal(true);
    expect(parent!.getRaw().includes("<ICF_NAME>NS</ICF_NAME>")).to.equal(true);
    expect(parent!.getRaw().includes("<ORIG_NAME>ns</ORIG_NAME>")).to.equal(true);
    expect(Array.from(reg.getObjects()).filter(o => o.getType() === "SICF").length).to.equal(2);
  });

  it("SICF, into a namespace, the node of the namespace once for two nodes", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zfoo           0e8aa5bbbb68f6118b9cd7023.sicf.xml", sicf("/sap/bc/zfoo/", "zfoo")),
      new MemoryFile("zbar           f230f47a2ba3a3417f9d7bb59.sicf.xml", sicf("/sap/bc/zbar/", "zbar")),
    ]).parse();
    new Renamer(reg).rename("SICF", "zfoo", "/ns/foo");
    new Renamer(reg).rename("SICF", "zbar", "/ns/bar");
    expect(reg.getObjectCount().normal).to.equal(3);
    expect(fileOf(reg, "bar            f73b2455d61f061f9d6bb1b22.sicf.xml")).to.not.equal(undefined);
  });

  it("SICF, into a namespace, the node of the namespace exists", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zfoo           0e8aa5bbbb68f6118b9cd7023.sicf.xml", sicf("/sap/bc/zfoo/", "zfoo")),
      new MemoryFile("ns             cb988e6036206c8d542135ca1.sicf.xml", sicf("/sap/bc/ns/", "ns")),
    ]).parse();
    new Renamer(reg).rename("SICF", "zfoo", "/ns/foo");
    expect(reg.getObjectCount().normal).to.equal(2);
  });

  it("SICF, into a namespace, name too long", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zfoo           0e8aa5bbbb68f6118b9cd7023.sicf.xml", sicf("/sap/bc/zfoo/", "zfoo")),
    ]).parse();
    expect(() => new Renamer(reg).rename("SICF", "zfoo", "/ns/abcdefghijklmnop")).to.throw();
  });

  it("namespacedURL", () => {
    expect(namespacedURL("/sap/bc/zfoo/", "zfoo", "ns", "foo")).to.equal("/sap/bc/ns/foo/");
    expect(namespacedURL("/sap/bc/bsp/sap/zfoo/", "ZFOO", "NS", "FOO")).to.equal("/sap/bc/bsp/ns/foo/");
    expect(namespacedURL("/sap/bc/ui5_ui5/sap/zfoo/", "zfoo", "ns", "foo")).to.equal("/sap/bc/ui5_ui5/ns/foo/");
    expect(namespacedURL("/sap/bc/srt/zfoo/", "zfoo", "ns", "foo")).to.equal("/sap/bc/srt/ns/foo/");
    expect(namespacedURL("/sap/bc/zfoo/bar/", "zfoo", "ns", "foo")).to.equal(undefined);
  });
});
