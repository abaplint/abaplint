import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {GlobalClass} from "../../src/rules/global_class";

async function run(file: MemoryFile){
  const reg = new Registry().addFile(file);
  await reg.parseAsync();

  const issues = new GlobalClass().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: global_class", () => {

  it("no error", async () => {
    const file = new MemoryFile("zidentical_cond.prog.abap", `WRITE hello.`);
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("intf public, error", async () => {
    const file = new MemoryFile("if_bar.intf.abap", "INTERFACE if_bar.\nENDINTERFACE.");
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("intf public, fixed", async () => {
    const file = new MemoryFile("if_bar.intf.abap", "INTERFACE if_bar PUBLIC.\nENDINTERFACE.");
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });
});
