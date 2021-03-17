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

  it("skip FOR TESTING, lower case", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS: method1 for testing.
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

  it("Global class with subclass", async () => {
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
    expect(issues.length).to.equal(0);
  });

  it("skip private constructor", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS: constructor.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD constructor.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("method2 is used in APPEND statement", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    METHODS:
      constructor,
      method2 RETURNING VALUE(str) TYPE string.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD constructor.
    DATA lt_strings TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    APPEND method2( ) TO lt_strings.
  ENDMETHOD.
  METHOD method2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("APPEND LINES OF", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    TYPES ty_table TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
    METHODS:
      constructor,
      method2 importing int type i RETURNING VALUE(rt_str) TYPE ty_table.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD constructor.
    DATA lt_strings TYPE ty_table.
    APPEND LINES OF method2( 2 ) TO lt_strings.
  ENDMETHOD.
  METHOD method2.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("pragma'ed", async () => {
    const abap = `
CLASS lcl_test DEFINITION ##NEEDED.
  PRIVATE SECTION.
    CLASS-METHODS get
      EXPORTING
        ev_test TYPE i ##CALLED.
ENDCLASS.

CLASS lcl_test IMPLEMENTATION.
  METHOD get.
    CLEAR ev_test.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
