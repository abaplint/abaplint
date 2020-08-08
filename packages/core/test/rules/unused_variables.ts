import {expect} from "chai";
import {UnusedVariables} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new UnusedVariables());
}

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  return new UnusedVariables().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: unused_variables, single file", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test2", async () => {
    const abap = "parser error.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test3", async () => {
    const abap = "WRITE bar.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test4", async () => {
    const abap = "DATA foo.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("test5", async () => {
    const abap = "DATA foo.\nWRITE foo.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("class with attribute", async () => {
    const abap =
`CLASS lcl_foo DEFINITION.
  PRIVATE SECTION.
    METHODS bar.
    DATA: mv_bits TYPE string.
ENDCLASS.

CLASS lcl_foo IMPLEMENTATION.
  METHOD bar.
    mv_bits = '123'.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("class with method", async () => {
    const abap = `
CLASS lcl_abapgit_zlib_stream DEFINITION.
  PUBLIC SECTION.
    METHODS take_int
      IMPORTING
        !iv_length    TYPE i
      RETURNING
        VALUE(rv_int) TYPE i.
ENDCLASS.

CLASS lcl_abapgit_zlib_stream IMPLEMENTATION.
  METHOD take_int.
    WRITE iv_length TO rv_int.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("dont report unused when there are syntax errors", async () => {
    const abap = `
    DATA lt_bar TYPE STANDARD TABLE OF i.
    APPEND sdfsdf TO lt_bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test, quickfix simple", async () => {
    testFix("DATA foo.", "");
  });

  it("test, quickfix with TYPE", async () => {
    testFix("DATA foo TYPE i.", "");
  });

  it("only one error per identifier", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS m1.
    DATA field TYPE string.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD m1.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("class attribute referenced via me->", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PRIVATE SECTION.
    METHODS m1.
    DATA field TYPE string.
ENDCLASS.

CLASS lcl_bar IMPLEMENTATION.
  METHOD m1.
    WRITE me->field.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  ///////////////

  it.skip("DATA with dashes", async () => {
    const abap = `DATA dummy-name TYPE i.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("dummy-name");
  });

  it.skip("test, quickfix, chained first", async () => {
    testFix(`DATA: foo, bar.
WRITE bar.`, `DATA: bar.
WRITE bar.`);
  });

  it.skip("test, quickfix, chained last", async () => {
    testFix(`DATA: bar, foo.
WRITE bar.`, `DATA: bar.
WRITE bar.`);
  });

  it.skip("test, quickfix, only one fix per scope per time", async () => {
    testFix(`DATA: foo, bar.`, `DATA: bar.`);
  });

});
