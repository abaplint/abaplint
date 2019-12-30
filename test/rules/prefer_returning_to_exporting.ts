import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {PreferReturningToExporting} from "../../src/rules";

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  const rule = new PreferReturningToExporting();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: prefer returning to exporting", function() {
  it("parser error", function () {
    const abap = "sdf lksjdf lkj sdf";
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", function () {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS:
      foobar.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", function () {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS:
      foobar RETURNING VALUE(rv_string) TYPE string.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue", function () {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test EXPORTING ev_sdfsd TYPE i.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("no issue, 2 exporting", function () {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test EXPORTING
    ev_sdfsd TYPE i
    ev_foo TYPE i.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("importing", function () {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test IMPORTING ev_sdfsd TYPE i.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("TYPE ANY", function () {
    const abap = `
CLASS zcl_abapgit_object_enho_class DEFINITION.
  PUBLIC SECTION.
    METHODS test EXPORTING ev_sdfsd TYPE any.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});