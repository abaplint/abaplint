import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename Global Interface", () => {

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_INTF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOINTERF>
    <CLSNAME>ZIF_ABAPGIT_AUTH</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Authorizations</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("INTF", () => {
    const abap = `INTERFACE zif_abapgit_auth PUBLIC.
ENDINTERFACE.`;

    const reg = new Registry().addFiles([
      new MemoryFile("zif_abapgit_auth.intf.abap", abap),
      new MemoryFile("zif_abapgit_auth.intf.xml", xml),
    ]).parse();

    new Renamer(reg).rename("INTF", "zif_abapgit_auth", "if_abapgit_auth");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "if_abapgit_auth.intf.abap") {
        const expected = `INTERFACE if_abapgit_auth PUBLIC.
ENDINTERFACE.`;
        expect(f.getRaw()).to.equal(expected);
      } else if (f.getFilename() === "if_abapgit_auth.intf.xml") {
        expect(f.getRaw().includes("<CLSNAME>IF_ABAPGIT_AUTH</CLSNAME>")).to.equal(true);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

});