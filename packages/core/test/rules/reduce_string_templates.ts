import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ReduceStringTemplates} from "../../src/rules";

function run(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.abap", abap)).parse();
  const issues = new ReduceStringTemplates().initialize(reg).run(reg.getObjects()[0]);
  return issues;
}

describe("Rule: reduce_string_templates", () => {

  it("ok", () => {
    const abap = "WRITE hello.";
    expect(run(abap).length).to.equal(0);
  });

  it("parser error", () => {
    const abap = "parser error";
    expect(run(abap).length).to.equal(0);
  });

  it("nested", () => {
    const abap = `WRITE |{ |sdf| }|.`;
    expect(run(abap).length).to.equal(1);
  });

  it("constant string", () => {
    const abap = `WRITE |{ 'sdf' }|.`;
    expect(run(abap).length).to.equal(1);
  });

});
