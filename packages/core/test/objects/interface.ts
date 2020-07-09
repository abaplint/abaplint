import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Interface} from "../../src/objects";
import {getABAPObjects} from "../get_abap";

describe("Objects, interface, getDescription", () => {
  it("test, positive", async () => {
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

    const reg = new Registry();
    reg.addFile(new MemoryFile("zif_foobar.intf.xml", xml));
    await reg.parseAsync();
    const intf = getABAPObjects(reg)[0] as Interface;
    expect(intf.getDescription()).to.equal("Authorizations");
  });
});
