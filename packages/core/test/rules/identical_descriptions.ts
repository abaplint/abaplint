import {Registry} from "../../src/registry";
import {IdenticalDescriptions} from "../../src/rules";
import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";

describe("rule, identical_descriptions", () => {
  const xml1 = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_KLAUS</CLSNAME>
      <LANGU>E</LANGU>
      <DESCRIPT>hello</DESCRIPT>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  const xml2 = `<?xml version="1.0" encoding="utf-8"?>
  <abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
   <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
    <asx:values>
     <VSEOCLASS>
      <CLSNAME>ZCL_KLAUS2</CLSNAME>
      <LANGU>E</LANGU>
      <DESCRIPT>hello</DESCRIPT>
      <STATE>1</STATE>
      <CLSCCINCL>X</CLSCCINCL>
      <FIXPT>X</FIXPT>
      <UNICODE>X</UNICODE>
     </VSEOCLASS>
    </asx:values>
   </asx:abap>
  </abapGit>`;

  it("test, single file, no error", () => {
    const reg = new Registry().addFile(new MemoryFile("zcl_clas1.clas.xml", xml1));
    const issues = new IdenticalDescriptions().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equals(0);
  });

  it("test, error expected", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zcl_clas1.clas.xml", xml1),
      new MemoryFile("zcl_clas2.clas.xml", xml2)]);
    const issues = new IdenticalDescriptions().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equals(1);
  });
});
