import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {TryWithoutCatch} from "../../src/rules/try_without_catch";

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const rule = new TryWithoutCatch();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: try without catch", () => {
  it("no issues", () => {
    expect(findIssues("WRITE foo.").length).to.equal(0);
  });

  it("issue", () => {
    expect(findIssues("TRY. ENDTRY.").length).to.equal(1);
  });

  it("fixed", () => {
    expect(findIssues("TRY. CATCH zcx_moo. ENDTRY.").length).to.equal(0);
  });

  it("parser error", () => {
    expect(findIssues("kjlsfklsdfj sdf").length).to.equal(0);
  });

  it("TRY with CLEANUP", () => {
    const abap = `
    TRY.
        ls_vseoclass = mi_object_oriented_object_fct->get_class_properties( ls_clskey ).
      CLEANUP.
        zcl_abapgit_language=>restore_login_language( ).
    ENDTRY.
    `;
    expect(findIssues(abap).length).to.equal(0);
  });
});