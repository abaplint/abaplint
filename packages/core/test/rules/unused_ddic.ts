import {expect} from "chai";
import {UnsecureFAE} from "../../src/rules/unsecure_fae";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IFile} from "../../src";

async function run(files: IFile[]){
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();

  const issues = new UnsecureFAE().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: unused_ddic", () => {

  it("no error", async () => {
    const files = [new MemoryFile("zunused_ddic.prog.abap", `WRITE 'moo'.`)];
    const issues = await run(files);
    expect(issues.length).to.equal(0);
  });

});
