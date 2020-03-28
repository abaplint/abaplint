import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {XMLConsistency} from "../../src/rules";
import {expect} from "chai";

describe("rule, xml_consistency, error", () => {
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

  const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml));

  const rule = new XMLConsistency();
  const issues = rule.run(reg.getObjects()[0], reg);
  it("test", () => {
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

  const reg = new Registry().addFile(new MemoryFile("zcl_lars.clas.xml", xml));

  const rule = new XMLConsistency();
  const issues = rule.run(reg.getObjects()[0], reg);
  it("test", () => {
    expect(issues.length).to.equals(0);
  });
});

