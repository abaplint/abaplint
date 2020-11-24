import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {MethodImplementedTwice} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  const rule = new MethodImplementedTwice();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: Method implemented twice", () => {

  it("parser error", async () => {
    const abap = "sdf lksjdf lkj sdf";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("no methods", async () => {
    const abap = `
    class lcl_bar definition.
    endclass.
    class lcl_bar implementation.
    endclass.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("twice", async () => {
    const abap = `
    class lcl_bar definition.
    endclass.
    class lcl_bar implementation.
    method bar.
    endmethod.
    method bar.
    endmethod.
    endclass.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});