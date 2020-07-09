import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {PreferReturningToExporting} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  const rule = new PreferReturningToExporting();
  return rule.initialize(reg).run(reg.getObjects()[0]);
}

describe("Rule: prefer returning to exporting", () => {
  it("parser error", async () => {
    const abap = "sdf lksjdf lkj sdf";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", async () => {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS:
      foobar.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", async () => {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS:
      foobar RETURNING VALUE(rv_string) TYPE string.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test EXPORTING ev_sdfsd TYPE i.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("no issue, 2 exporting", async () => {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test EXPORTING
    ev_sdfsd TYPE i
    ev_foo TYPE i.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("importing", async () => {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test IMPORTING ev_sdfsd TYPE i.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("TYPE ANY", async () => {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test EXPORTING ev_sdfsd TYPE any.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, already have RETURNING", async () => {
    const abap = `
CLASS zcl_moo DEFINITION.
  PUBLIC SECTION.
  METHODS:
      bin_to_bin_tab IMPORTING iv_xstring        TYPE xsequence
                     EXPORTING ev_length         TYPE i
                     RETURNING VALUE(rt_bin_tab) TYPE gty_bin_tab.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok, generic", async () => {
    const abap = `
    CLASS zcl_moo DEFINITION.
    PUBLIC SECTION.
  METHODS:
    get_next_single IMPORTING iv_number_range TYPE nrnr
                              iv_subobject    TYPE nrsobj OPTIONAL
                    EXPORTING eg_number       TYPE  clike
                    RAISING   /abc/cx_some_exception_class.
                    ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});