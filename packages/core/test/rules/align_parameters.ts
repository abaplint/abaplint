import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AlignParameters} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new AlignParameters();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: align_parameters", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it.skip("call function, issue", async () => {
    const abap = `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo = 2
    parameter = 3.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("call function, fixed", async () => {
    const abap = `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo       = 2
    parameter = 3.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});
