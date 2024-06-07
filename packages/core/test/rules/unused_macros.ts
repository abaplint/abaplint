import {expect} from "chai";
import {UnusedMacros} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  return new UnusedMacros().initialize(reg).run(reg.getFirstObject()!);
}

describe.only("Rule: unused_macros, single file", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("single issue", async () => {
    const abap = `DEFINE foobar.
END-OF-DEFINITION.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
