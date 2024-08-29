import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AddTestAttributes} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new AddTestAttributes();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe.only("Rule: implicit_start_of_selection", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues(`REPORT zfoo.
WRITE 'hello'.`);
    expect(issues.length).to.equal(2);
  });

  it("fixed", async () => {
    const issues = await findIssues(`REPORT zfoo.
START-OF-SELECTION.
  WRITE 'hello'.`);
    expect(issues.length).to.equal(0);
  });

});
