import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {MixReturning} from "../../src/rules";

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  const rule = new MixReturning();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: mix returning", function() {
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
    METHODS:
      foobar EXPORTING foo TYPE i RETURNING VALUE(rv_string) TYPE string.
ENDCLASS.`;
    const issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});