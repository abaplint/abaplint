import {expect} from "chai";
import {CheckDDIC} from "../../src/rules/check_ddic";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";

describe("Rule: no_unknown_ddic", () => {

  it("ok, resolved, dtel", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDDIC</ROLLNAME>
    <DATATYPE>CHAR</DATATYPE>
    <LENG>000002</LENG>
    <OUTPUTLEN>000002</OUTPUTLEN>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zddic.dtel.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(0);
  });

  it("error", async () => {
    const xml = "sdf";
    const reg = new Registry().addFile(new MemoryFile("zddic.dtel.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
  });

  it("error, DOMNAME unexpectedly empty", async () => {
    const xml = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>ZDDIC</ROLLNAME>
    <DOMNAME></DOMNAME>
    <REFKIND>D</REFKIND>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
    const reg = new Registry().addFile(new MemoryFile("zddic.dtel.xml", xml));
    await reg.parseAsync();

    const issues = new CheckDDIC().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("DOMNAME unexpectely empty");
  });

});
