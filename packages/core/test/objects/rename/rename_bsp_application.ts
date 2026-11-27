import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";
import {IRegistry} from "../../../src/_iregistry";

describe("Rename BSP application", () => {

  function xml(name: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_WAPA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <ATTRIBUTES>
    <APPLNAME>${name}</APPLNAME>
    <APPLEXT>${name}</APPLEXT>
    <SECURITY>X</SECURITY>
    <TEXT>application</TEXT>
   </ATTRIBUTES>
   <PAGES>
    <item>
     <ATTRIBUTES>
      <APPLNAME>${name}</APPLNAME>
      <PAGEKEY>INDEX.HTML</PAGEKEY>
      <PAGENAME>index.html</PAGENAME>
      <MIMETYPE>text/html</MIMETYPE>
     </ATTRIBUTES>
    </item>
    <item>
     <ATTRIBUTES>
      <APPLNAME>${name}</APPLNAME>
      <PAGEKEY>THIRDPARTY/ZFOO/LIB.JS</PAGEKEY>
      <PAGENAME>thirdparty/zfoo/Lib.js</PAGENAME>
      <PAGETYPE>X</PAGETYPE>
     </ATTRIBUTES>
    </item>
   </PAGES>
  </asx:values>
 </asx:abap>
</abapGit>`;
  }

  function files(folder: string): MemoryFile[] {
    return [
      new MemoryFile(folder + "zfoo.wapa.xml", xml("ZFOO")),
      new MemoryFile(folder + "zfoo.wapa.index.html", "<html></html>"),
      new MemoryFile(folder + "zfoo.wapa.thirdparty_-zfoo_-lib.js", "// zfoo"),
    ];
  }

  function names(reg: IRegistry): string[] {
    return Array.from(reg.getFiles()).map(f => f.getFilename()).sort();
  }

  it("WAPA", () => {
    const reg = new Registry().addFiles(files("")).parse();
    new Renamer(reg).rename("WAPA", "zfoo", "zbar");

    expect(reg.getObjectCount().normal).to.equal(1);
    expect(names(reg)).to.deep.equal([
      "zbar.wapa.index.html",
      "zbar.wapa.thirdparty_-zfoo_-lib.js",
      "zbar.wapa.xml",
    ]);
    const raw = reg.getFileByName("zbar.wapa.xml")!.getRaw();
    expect(raw).to.include("<APPLNAME>ZBAR</APPLNAME>");
    expect(raw).to.include("<APPLEXT>ZBAR</APPLEXT>");
    expect(raw).to.not.include("<APPLNAME>ZFOO</APPLNAME>");
    // the pages keep their names, their files are found by them
    expect(raw).to.include("<PAGEKEY>THIRDPARTY/ZFOO/LIB.JS</PAGEKEY>");
    expect(raw).to.include("<PAGENAME>thirdparty/zfoo/Lib.js</PAGENAME>");
    expect(reg.getFileByName("zbar.wapa.thirdparty_-zfoo_-lib.js")!.getRaw()).to.equal("// zfoo");
  });

  it("WAPA, into a namespace, in a folder of the old name", () => {
    const reg = new Registry().addFiles(files("src/zfoo/")).parse();
    new Renamer(reg).rename("WAPA", "zfoo", "/ns/bar");

    expect(reg.getObjectCount().normal).to.equal(1);
    expect(names(reg)).to.deep.equal([
      "src/zfoo/#ns#bar.wapa.index.html",
      "src/zfoo/#ns#bar.wapa.thirdparty_-zfoo_-lib.js",
      "src/zfoo/#ns#bar.wapa.xml",
    ]);
    const raw = reg.getFileByName("src/zfoo/#ns#bar.wapa.xml")!.getRaw();
    expect(raw).to.include("<APPLNAME>/NS/BAR</APPLNAME>");
    expect(raw).to.include("<APPLEXT>/NS/BAR</APPLEXT>");
    expect(reg.getObject("WAPA", "/NS/BAR")).to.not.equal(undefined);
  });

  it("WAPA, out of a namespace", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("#ns#bar.wapa.xml", xml("/NS/BAR")),
      new MemoryFile("#ns#bar.wapa.index.html", "<html></html>"),
    ]).parse();
    new Renamer(reg).rename("WAPA", "/ns/bar", "zfoo");

    expect(names(reg)).to.deep.equal(["zfoo.wapa.index.html", "zfoo.wapa.xml"]);
    expect(reg.getFileByName("zfoo.wapa.xml")!.getRaw()).to.include("<APPLNAME>ZFOO</APPLNAME>");
  });

  function smim(url: string, folder: boolean): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SMIM" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>${url}</URL>
   ${folder ? "<FOLDER>X</FOLDER>\n   " : ""}<CLASS>${folder ? "M_FOLDER" : "M_TEXT_L"}</CLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;
  }

  function mime(): MemoryFile[] {
    return [
      new MemoryFile("0a000000000000000000000000000001.smim.xml", smim("/SAP/BC/BSP/SAP/ZFOO", true)),
      new MemoryFile("0a000000000000000000000000000002.smim.xml", smim("/SAP/BC/BSP/SAP/ZFOO/img/logo.txt", false)),
      new MemoryFile("0a000000000000000000000000000003.smim.xml", smim("/sap/bc/bsp/sap/zfoo/lower.txt", false)),
      new MemoryFile("0a000000000000000000000000000004.smim.xml", smim("/SAP/BC/BSP/SAP/ZFOOBAR", true)),
      new MemoryFile("0a000000000000000000000000000005.smim.xml", smim("/SAP/PUBLIC/ZFOO", true)),
    ];
  }

  function url(reg: IRegistry, n: number): string {
    const raw = reg.getFileByName("0a00000000000000000000000000000" + n + ".smim.xml")!.getRaw();
    return raw.match(/<URL>(.*)<\/URL>/)![1];
  }

  it("WAPA, the MIME folder of the application moves with it", () => {
    const reg = new Registry().addFiles([...files(""), ...mime()]).parse();
    new Renamer(reg).rename("WAPA", "zfoo", "zbar");

    expect(url(reg, 1)).to.equal("/SAP/BC/BSP/SAP/ZBAR");
    expect(url(reg, 2)).to.equal("/SAP/BC/BSP/SAP/ZBAR/img/logo.txt");
    expect(url(reg, 3)).to.equal("/sap/bc/bsp/sap/zbar/lower.txt");
    // another application, a folder outside the BSP folders
    expect(url(reg, 4)).to.equal("/SAP/BC/BSP/SAP/ZFOOBAR");
    expect(url(reg, 5)).to.equal("/SAP/PUBLIC/ZFOO");
    // the MIME objects keep their GUID names
    expect(reg.getObjectCount().normal).to.equal(6);
  });

  it("WAPA, the MIME folder into a namespace", () => {
    const reg = new Registry().addFiles([...files(""), ...mime()]).parse();
    new Renamer(reg).rename("WAPA", "zfoo", "/ns/bar");

    expect(url(reg, 1)).to.equal("/SAP/BC/BSP/NS/BAR");
    expect(url(reg, 2)).to.equal("/SAP/BC/BSP/NS/BAR/img/logo.txt");
    expect(url(reg, 3)).to.equal("/sap/bc/bsp/ns/bar/lower.txt");
  });

  it("WAPA, the MIME folder out of a namespace", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("#ns#bar.wapa.xml", xml("/NS/BAR")),
      new MemoryFile("0a000000000000000000000000000001.smim.xml", smim("/SAP/BC/BSP/NS/BAR", true)),
      new MemoryFile("0a000000000000000000000000000002.smim.xml", smim("/SAP/BC/BSP/NS/BAR/logo.txt", false)),
    ]).parse();
    new Renamer(reg).rename("WAPA", "/ns/bar", "zfoo");

    expect(url(reg, 1)).to.equal("/SAP/BC/BSP/SAP/ZFOO");
    expect(url(reg, 2)).to.equal("/SAP/BC/BSP/SAP/ZFOO/logo.txt");
  });
});
