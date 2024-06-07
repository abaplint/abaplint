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

describe("Rule: unused_macros, single file", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("macro not in use, single issue", async () => {
    const abap = `DEFINE foobar.
  WRITE 'hello'.
END-OF-DEFINITION.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

  it("macro in use, no issue", async () => {
    const abap = `DEFINE foobar.
  WRITE 'hello'.
END-OF-DEFINITION.

foobar.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
