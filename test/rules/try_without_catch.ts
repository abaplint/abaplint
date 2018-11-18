import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {TryWithoutCatch} from "../../src/rules/try_without_catch";

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const rule = new TryWithoutCatch();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: try without catch", function() {
  it("no issues", function () {
    expect(findIssues("WRITE foo.").length).to.equal(0);
  });

  it("issue", function () {
    expect(findIssues("TRY. ENDTRY.").length).to.equal(1);
  });

  it("fixed", function () {
    expect(findIssues("TRY. CATCH zcx_moo. ENDTRY.").length).to.equal(0);
  });

  it("parser error", function () {
    expect(findIssues("kjlsfklsdfj sdf").length).to.equal(0);
  });
});