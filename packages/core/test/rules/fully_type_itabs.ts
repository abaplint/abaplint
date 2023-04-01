import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {FullyTypeITabs} from "../../src/rules/fully_type_itabs";

async function run(file: MemoryFile){
  const reg = new Registry().addFile(file);
  await reg.parseAsync();

  const issues = new FullyTypeITabs().initialize(reg).run(reg.getFirstObject()!);
  return issues;
}

describe("Rule: fully_type_itabs", () => {

  it("no error", async () => {
    const file = new MemoryFile("zidentical_cond.prog.abap", `WRITE hello.`);
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("no error", async () => {
    const abap = `DATA lt_foo TYPE STANDARD TABLE OF ty WITH EMPTY KEY.`;
    const file = new MemoryFile("zidentical_cond.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(0);
  });

  it("specify table type", async () => {
    const abap = `DATA lt_foo TYPE TABLE OF ty.`;
    const file = new MemoryFile("zidentical_cond.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

  it("specify table key", async () => {
    const abap = `DATA lt_bar TYPE STANDARD TABLE OF ty.`;
    const file = new MemoryFile("zidentical_cond.prog.abap", abap);
    const issues = await run(file);
    expect(issues.length).to.equal(1);
  });

});
