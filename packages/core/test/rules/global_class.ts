import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {GlobalClass} from "../../src/rules/global_class";


async function run(file: MemoryFile, file2?: MemoryFile) {
  const reg = new Registry().addFile(file);
  if (file2) {
    reg.addFile(file2);
  }
  await reg.parseAsync();

  const issues = new GlobalClass().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: global_class", () => {

  it("no error", async () => {
    const file = new MemoryFile("zidentical_cond.prog.abap", `WRITE hello.`);
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("intf public, error", async () => {
    const file = new MemoryFile("if_bar.intf.abap", "INTERFACE if_bar.\nENDINTERFACE.");
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("intf public, fixed", async () => {
    const file = new MemoryFile("if_bar.intf.abap", "INTERFACE if_bar PUBLIC.\nENDINTERFACE.");
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("global class must be global", async () => {
    const file = new MemoryFile("class.clas.abap", `
CLASS class definition.
endclass.
class class implementation.
endclass.`);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("class must match filename, implementation and definition", async () => {
    const file = new MemoryFile("class1.clas.abap", `
CLASS class2 definition public.
endclass.
class class2 implementation.
endclass.`);
    const issues = await run(file);
    expect(issues.length).to.equal(2);
  });

  it("intf must match filename", async () => {
    const file = new MemoryFile("zif_aff_oo_types_v1.intf.abap", `
INTERFACE zif_oo_aff_types_v1 PUBLIC.
ENDINTERFACE.`);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("Global class for testing", async () => {
    const file = new MemoryFile("zcl_abapgit_injector.clas.abap", `
CLASS zcl_abapgit_injector DEFINITION
  PUBLIC
  FOR TESTING
  CREATE PRIVATE.
ENDCLASS.

CLASS zcl_abapgit_injector IMPLEMENTATION.
ENDCLASS.`);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("Global class for testing, fixed", async () => {
    const file = new MemoryFile("zcl_abapgit_injector.clas.abap", `
CLASS zcl_abapgit_injector DEFINITION
  PUBLIC
  FOR TESTING
  CREATE PRIVATE.
ENDCLASS.

CLASS zcl_abapgit_injector IMPLEMENTATION.
ENDCLASS.`);
    const file2 = new MemoryFile("zcl_abapgit_injector.clas.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_ABAPGIT_INJECTOR</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>abapGit - Injector</DESCRIPT>
    <CATEGORY>05</CATEGORY>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`);
    const issues = await run(file, file2);
    expect(issues.length).to.equal(0);
  });

  it("Global class for testing, not specified in xml", async () => {
    const file = new MemoryFile("zcl_abapgit_injector.clas.abap", `
CLASS zcl_abapgit_injector DEFINITION
  PUBLIC
  FOR TESTING
  CREATE PRIVATE.
ENDCLASS.

CLASS zcl_abapgit_injector IMPLEMENTATION.
ENDCLASS.`);
    const file2 = new MemoryFile("zcl_abapgit_injector.clas.xml", `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_CLAS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>ZCL_ABAPGIT_INJECTOR</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>abapGit - Injector</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`);
    const issues = await run(file, file2);
    expect(issues.length).to.equal(1);
  });


});
