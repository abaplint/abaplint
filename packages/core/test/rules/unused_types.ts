import {expect} from "chai";
import {UnusedTypes} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  return new UnusedTypes().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: unused_types, single file", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test2", async () => {
    const abap = "parser error.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test3", async () => {
    const abap = "WRITE bar.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("test4", async () => {
    const abap = "TYPES bar TYPE c LENGTH 1.";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("test5", async () => {
    const abap = `
    TYPES bar TYPE c LENGTH 1.
    DATA foo TYPE bar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
