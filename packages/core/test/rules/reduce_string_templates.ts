import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ReduceStringTemplates} from "../../src/rules";
import {Issue} from "../../src/issue";

async function run(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap));
  await reg.parseAsync();
  return new ReduceStringTemplates().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: reduce_string_templates", () => {

  it("ok", async () => {
    const abap = "WRITE hello.";
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("parser error", async () => {
    const abap = "parser error";
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

  it("nested", async () => {
    const abap = `WRITE |{ |sdf| }|.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("constant string", async () => {
    const abap = `WRITE |{ 'sdf' }|.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("constant string, ticks", async () => {
    const abap = "WRITE |{ `sdf` }|.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("constant string templates on same line", async () => {
    const abap = "WRITE |sdfsd| && |sdfds|.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("constant string templates on same line", async () => {
    const abap = "WRITE |sdfsd| && var.";
    const issues = await run(abap);
    expect(issues.length).to.equal(1);
  });

  it("with options", async () => {
    const abap = `
    PARAMETERS p_width TYPE i.
    DATA(str) = |{ '' WIDTH = p_width PAD = '=' }|.`;
    const issues = await run(abap);
    expect(issues.length).to.equal(0);
  });

});
