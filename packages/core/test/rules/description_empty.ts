import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files";
import {DescriptionEmpty} from "../../src/rules";
import {expect} from "chai";

describe("rule, description_empty, error", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_KLAUS</CLSNAME>
      <LANGU>E</LANGU>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  const reg = new Registry().addFile(new MemoryFile("zcl_klaus.clas.xml", xml));

  const rule = new DescriptionEmpty();
  const issues = rule.run(reg.getObjects()[0], reg);
  it("test", () => {
    expect(issues.length).to.equals(1);
  });
});

describe("rule, description_empty, okay", () => {
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

  const reg = new Registry().addFile(new MemoryFile("zcl_klaus.clas.xml", xml));

  const rule = new DescriptionEmpty();
  const issues = rule.run(reg.getObjects()[0], reg);
  it("test", () => {
    expect(issues.length).to.equals(0);
  });
});

describe("rule, description_empty, okay, namespaced", () => {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>/FOO/CL_KLAUS</CLSNAME>
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

  const reg = new Registry().addFile(new MemoryFile("#foo#cl_klaus.clas.xml", xml));

  const rule = new DescriptionEmpty();
  const issues = rule.run(reg.getObjects()[0], reg);
  it("test", () => {
    expect(issues.length).to.equals(0);
  });
});

