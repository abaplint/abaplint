import {expect} from "chai";
import {CheckInclude} from "../../../src/rules";
import {Registry} from "../../../src/registry";
import {MemoryFile} from "../../../src/files";
import {Issue} from "../../../src/issue";

function runMulti(files: {filename: string, contents: string}[]): Issue[] {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  reg.parse();
  let issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    issues = issues.concat(new CheckInclude().run(obj, reg));
  }
  return issues;
}

describe("Rules, check_include", () => {
  it("parser error", () => {
    const issues = runMulti([{filename: "cl_foo.clas.abap", contents: "parser error"}]);
    expect(issues.length).to.equals(0);
  });

  it("not found", () => {
    const contents = `INCLUDE znot_found.`;
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("found", () => {
    const issues = runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zexists.prog.xml", contents: `<SUBC>I</SUBC>`},
      {filename: "zfoo.prog.abap", contents: `INCLUDE zexists.`}]);
    expect(issues.length).to.equals(0);
  });

  it("error, not possible to INCLUDE main program", () => {
    const issues = runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zfoo.prog.abap", contents: `INCLUDE zexists.`}]);
    expect(issues.length).to.equals(1);
  });

  it("not found, IF FOUND", () => {
    const contents = `INCLUDE znot_found IF FOUND.`;
    const issues = runMulti([{filename: "zfoo.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("not used", () => {
    const issues = runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zexists.prog.xml", contents: `<SUBC>I</SUBC>`}]);
    expect(issues.length).to.equals(1);
  });

  it("Function group", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AREAT>test</AREAT>
   <INCLUDES>
    <SOBJ_NAME>LZABAPGIT_UNIT_TESTTOP</SOBJ_NAME>
    <SOBJ_NAME>SAPLZABAPGIT_UNIT_TEST</SOBJ_NAME>
   </INCLUDES>
   <FUNCTIONS>
    <item>
     <FUNCNAME>Z_ABAPGIT_UNIT_TEST</FUNCNAME>
     <SHORT_TEXT>test</SHORT_TEXT>
    </item>
   </FUNCTIONS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const issues = runMulti([
      {filename: "zabapgit_unit_test.fugr.saplzabapgit_unit_test.abap", contents: `
INCLUDE LZABAPGIT_UNIT_TESTTOP.
INCLUDE LZABAPGIT_UNIT_TESTUXX.`},
      {filename: "zabapgit_unit_test.fugr.lzabapgit_unit_testtop.abap", contents: `
FUNCTION-POOL ZABAPGIT_UNIT_TEST.`},
      {filename: "zabapgit_unit_test.fugr.xml", contents: xml}]);
    expect(issues.length).to.equals(0);
  });

  it.skip("Function group, namespaced", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AREAT>test</AREAT>
   <INCLUDES>
    <SOBJ_NAME>/ABC/LBC_EVENTSTOP</SOBJ_NAME>
    <SOBJ_NAME>/ABC/LBC_EVENTSUXX</SOBJ_NAME>
   </INCLUDES>
   <FUNCTIONS>
    <item>
     <FUNCNAME>/ABC/BC_EVENTS</FUNCNAME>
     <SHORT_TEXT>test</SHORT_TEXT>
    </item>
   </FUNCTIONS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const issues = runMulti([
      {filename: "#abc#bc_events.fugr.#abc#saplbc_events.abap", contents: `
      INCLUDE /ABC/LBC_EVENTSTOP.
      INCLUDE /ABC/LBC_EVENTSUXX.`},
      {filename: "#abc#bc_events.fugr.#abc#lbc_eventstop.abap", contents: `
      FUNCTION-POOL /ABC/BC_EVENTS.`},
      {filename: "#abc#bc_events.fugr.xml", contents: xml}]);
    expect(issues.length).to.equals(0);
  });

});