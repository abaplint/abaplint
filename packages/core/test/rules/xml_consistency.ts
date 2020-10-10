import {Registry} from "../../src/registry";
import {XMLConsistency} from "../../src/rules";
import {expect} from "chai";
import {IRegistry} from "../../src/_iregistry";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";

async function run(reg: IRegistry): Promise<Issue[]> {
  await reg.parseAsync();
  const rule = new XMLConsistency();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_KLAUS</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Description</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;

describe("rule, xml_consistency, error", async () => {

  it("test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml));
    const issues = await run(reg);

    expect(issues.length).to.equals(1);
  });
});

describe("rule, xml_consistency, okay", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_LARS</CLSNAME>
      <LANGU>E</LANGU>
      <DESCRIPT>Description</DESCRIPT>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  const abap = `
    CLASS ZCL_LARS DEFINITION PUBLIC CREATE PUBLIC .
    ENDCLASS.
    CLASS ZCL_LARS IMPLEMENTATION.
    ENDCLASS.`;

  it("test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml)).addFile(new MemoryFile("zcl_lars.clas.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(0);
  });
});

describe("rule, xml_consistency, mismatch xml and abap", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_LARS</CLSNAME>
      <LANGU>E</LANGU>
      <DESCRIPT>Description</DESCRIPT>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  const abap = `
    CLASS cl_lars DEFINITION PUBLIC CREATE PUBLIC .
    ENDCLASS.
    CLASS cl_lars IMPLEMENTATION.
    ENDCLASS.`;

  it("test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml)).addFile(new MemoryFile("zcl_lars.clas.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });
});

describe("rule, xml_consistency, INTF mismatch xml and abap", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_INTF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOINTERF>
    <CLSNAME>ZIF_ABAPGIT_XML_INPUT</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>Interface for XML INPUT</DESCRIPT>
    <EXPOSURE>2</EXPOSURE>
    <STATE>1</STATE>
    <UNICODE>X</UNICODE>
   </VSEOINTERF>
  </asx:values>
 </asx:abap>
</abapGit>`;

  const abap = `
INTERFACE if_abapgit_xml_input PUBLIC.
ENDINTERFACE.`;

  it("test", async () => {
    const reg = new Registry().addFile(new MemoryFile("zif_abapgit_xml_input.intf.xml", xml)).addFile(new MemoryFile("zif_abapgit_xml_input.intf.abap", abap));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });
});

describe("xml consistency", () => {
  it("parser error", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_lars.msag.xml", `parser error`));
    const issues = await run(reg);
    expect(issues.length).to.equals(1);
  });

  it("parser error, xml ok, abap not", async () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_klaus.clas.xml", xml)).addFile(new MemoryFile("zcl_klaus.clas.abap", "parser error"));
    const issues = await run(reg);
    expect(issues.length).to.equals(0);
  });
});
