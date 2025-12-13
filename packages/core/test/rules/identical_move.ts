import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {IdenticalMove} from "../../src/rules";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap));
  await reg.parseAsync();
  const rule = new IdenticalMove();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: identical_move", () => {

  it("test 1", async () => {
    const abap = `
data foo type i.
foo = 5.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("test 2", async () => {
    const abap = `
data foo type i.
foo = foo.
    `;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});
