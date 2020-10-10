import {expect} from "chai";
import {CheckInclude} from "../../src/rules";
import {Registry} from "../../src/registry";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";

async function runMulti(files: {filename: string, contents: string}[]): Promise<Issue[]> {
  const reg = new Registry();
  for (const file of files) {
    reg.addFile(new MemoryFile(file.filename, file.contents));
  }
  await reg.parseAsync();
  let issues: Issue[] = [];
  for (const obj of reg.getObjects()) {
    issues = issues.concat(new CheckInclude().initialize(reg).run(obj));
  }
  return issues;
}

describe("Rules, check_include", () => {
  it("parser error", async () => {
    const issues = await runMulti([{filename: "cl_foo.clas.abap", contents: "parser error"}]);
    expect(issues.length).to.equals(0);
  });

  it("not found", async () => {
    const contents = `INCLUDE znot_found.`;
    const issues = await runMulti([{filename: "zfoo_chinc.prog.abap", contents}]);
    expect(issues.length).to.equals(1);
  });

  it("found", async () => {
    const issues = await runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zexists.prog.xml", contents: `<SUBC>I</SUBC>`},
      {filename: "zfoo_chinc.prog.abap", contents: `INCLUDE zexists.`}]);
    expect(issues.length).to.equals(0);
  });

  it("error, not possible to INCLUDE main program", async () => {
    const issues = await runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zfoo_chinc.prog.abap", contents: `INCLUDE zexists.`}]);
    expect(issues.length).to.equals(1);
  });

  it("not found, IF FOUND", async () => {
    const contents = `INCLUDE znot_found IF FOUND.`;
    const issues = await runMulti([{filename: "zfoo_chinc.prog.abap", contents}]);
    expect(issues.length).to.equals(0);
  });

  it("not used", async () => {
    const issues = await runMulti([
      {filename: "zexists.prog.abap", contents: `WRITE 2.`},
      {filename: "zexists.prog.xml", contents: `<SUBC>I</SUBC>`}]);
    expect(issues.length).to.equals(1);
  });

  it("Function group", async () => {
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

    const issues = await runMulti([
      {filename: "zabapgit_unit_test.fugr.saplzabapgit_unit_test.abap", contents: `
INCLUDE LZABAPGIT_UNIT_TESTTOP.
INCLUDE LZABAPGIT_UNIT_TESTUXX.`},
      {filename: "zabapgit_unit_test.fugr.lzabapgit_unit_testtop.abap", contents: `
FUNCTION-POOL ZABAPGIT_UNIT_TEST.`},
      {filename: "zabapgit_unit_test.fugr.xml", contents: xml}]);
    expect(issues.length).to.equals(0);
  });

  it("Function group, namespaced", async () => {
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

    const issues = await runMulti([
      {filename: "#abc#bc_events.fugr.#abc#saplbc_events.abap", contents: `
      INCLUDE /ABC/LBC_EVENTSTOP.
      INCLUDE /ABC/LBC_EVENTSUXX.`},
      {filename: "#abc#bc_events.fugr.#abc#lbc_eventstop.abap", contents: `
      FUNCTION-POOL /ABC/BC_EVENTS.`},
      {filename: "#abc#bc_events.fugr.xml", contents: xml}]);
    expect(issues.length).to.equals(0);
  });

  it("with special characters", async () => {
    const issues = await runMulti([
      {filename: "%3cicon%3e.prog.abap", contents: `WRITE 'hello world'.`},
      {filename: "%3cicon%3e.prog.xml", contents: `<SUBC>I</SUBC>`},
      {filename: "zfoobar.prog.abap", contents: `INCLUDE <icon>.`},
    ]);
    expect(issues.length).to.equals(0);
  });

});