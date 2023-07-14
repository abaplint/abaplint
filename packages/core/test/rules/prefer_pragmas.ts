import {expect} from "chai";
import {MemoryFile, Registry} from "../../src";
import {PreferPragmas} from "../../src/rules";

async function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new PreferPragmas();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: prefer_pragmas", () => {

  it("parser error", async () => {
    const abap = `dsflkjdsflkjfds ljdsfds`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("needed", async () => {
    const abap = `MESSAGE e001(zabc) INTO DATA(dummy). "#EC NEEDED`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("needed, fixed", async () => {
    const abap = `MESSAGE e001(zabc) INTO DATA(dummy) ##NEEDED.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});