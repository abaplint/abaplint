import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {MixReturning} from "../../src/rules";

function findIssues(abap: string) {
  let reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  let rule = new MixReturning();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: local variable names", function() {
  it("parser error", function () {
    const abap = "sdf lksjdf lkj sdf";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", function () {
    const abap = "CLASS zcl_abapgit_object_enho_class DEFINITION.\n" +
      "PUBLIC SECTION.\n" +
      "  METHODS:\n" +
      "   foobar.\n" +
      "ENDCLASS.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", function () {
    const abap = "CLASS zcl_abapgit_object_enho_class DEFINITION.\n" +
      "PUBLIC SECTION.\n" +
      "  METHODS:\n" +
      "   foobar RETURNING VALUE(rv_string) TYPE string.\n" +
      "ENDCLASS.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue", function () {
    const abap = "CLASS zcl_abapgit_object_enho_class DEFINITION.\n" +
      "PUBLIC SECTION.\n" +
      "  METHODS:\n" +
      "   foobar EXPORTING foo TYPE i RETURNING VALUE(rv_string) TYPE string.\n" +
      "ENDCLASS.";
    let issues = findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});