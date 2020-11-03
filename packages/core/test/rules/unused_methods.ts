import {expect} from "chai";
import {UnusedMethods} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  return new UnusedMethods().initialize(reg).run(reg.getFirstObject()!);
}

async function runMulti(files: MemoryFile[]): Promise<Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  let issues: Issue[] = [];
  for (const o of reg.getObjects()) {
    issues = issues.concat(new UnusedMethods().initialize(reg).run(o));
  }
  return issues;
}

describe("Rule: unused_methods, single file", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test3", async () => {
    const abap = "WRITE bar.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("local class private method, one issue expected", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS: method1.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("local class public method, no issues", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS: method1.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("skip FOR TESTING", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS: method1 FOR TESTING.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD method1.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("Skip SETUP method in testclasses", async () => {
    const abap = `
CLASS lcl_bar DEFINITION FOR TESTING.
  PRIVATE SECTION.
    METHODS: setup.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD setup.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("subclass, local program", async () => {
    const abap = `
CLASS zcl_xml DEFINITION.
  PROTECTED SECTION.
    METHODS to_xml.
ENDCLASS.
CLASS zcl_xml IMPLEMENTATION.
  METHOD to_xml.
  ENDMETHOD.
ENDCLASS.

CLASS zcl_output DEFINITION INHERITING FROM zcl_xml.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS zcl_output IMPLEMENTATION.
  METHOD bar.
    to_xml( ).
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
  NEW zcl_output( )->bar( ).`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it.skip("Global class with subclass", async () => {
    const abap1 = `CLASS zcl_xml DEFINITION PUBLIC.
  PROTECTED SECTION.
    METHODS to_xml.
ENDCLASS.
CLASS zcl_xml IMPLEMENTATION.
  METHOD to_xml.
  ENDMETHOD.
ENDCLASS.`;
    const file1 = new MemoryFile("zcl_xml.clas.abap", abap1);

    const abap2 = `CLASS zcl_output DEFINITION PUBLIC INHERITING FROM zcl_xml.
  PUBLIC SECTION.
    METHODS bar.
ENDCLASS.
CLASS zcl_output IMPLEMENTATION.
  METHOD bar.
    to_xml( ).
  ENDMETHOD.
ENDCLASS.`;
    const file2 = new MemoryFile("zcl_output.clas.abap", abap2);

    const issues = await runMulti([file1, file2]);
    console.dir(issues);
    expect(issues.length).to.equal(0);
  });

});
