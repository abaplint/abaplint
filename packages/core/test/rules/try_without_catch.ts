import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {TryWithoutCatch} from "../../src/rules/try_without_catch";

async function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new TryWithoutCatch();
  return rule.initialize(reg).run(reg.getObjects()[0]);
}

describe("Rule: try without catch", () => {
  it("no issues", async () => {
    const issues = await findIssues("WRITE foo.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues("TRY. ENDTRY.");
    expect(issues.length).to.equal(1);
  });

  it("fixed", async () => {
    const issues = await findIssues("TRY. CATCH zcx_moo. ENDTRY.");
    expect(issues.length).to.equal(0);
  });

  it("parser error", async () => {
    const issues = await findIssues("kjlsfklsdfj sdf");
    expect(issues.length).to.equal(0);
  });

  it("TRY with CLEANUP", async () => {
    const abap = `
    TRY.
        ls_vseoclass = mi_object_oriented_object_fct->get_class_properties( ls_clskey ).
      CLEANUP.
        zcl_abapgit_language=>restore_login_language( ).
    ENDTRY.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });
});