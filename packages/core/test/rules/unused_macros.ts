import {expect} from "chai";
import {UnusedMacros} from "../../src/rules";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {Config, IConfiguration} from "../../src";

function getConfig(): IConfiguration {
  const conf = Config.getDefault().get();
  conf.syntax.globalMacros = ["global_macro"];
  return new Config(JSON.stringify(conf));
}

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry()
    .setConfig(getConfig())
    .addFile(new MemoryFile("zfoo.prog.abap", abap));
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

  it("ignore global macros", async () => {
    const abap = `WRITE 'hello'.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

});
