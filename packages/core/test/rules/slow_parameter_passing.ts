import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {SlowParameterPassing} from "../../src/rules";

async function findIssues(abap: string, filename: string) {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new SlowParameterPassing();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: slow_parameter_passing", () => {

  it.skip("one issue", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS bar IMPORTING VALUE(sdf) TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD bar.
    WRITE sdf.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zslowpass.prog.abap");
    expect(issues.length).to.equal(1);
  });

});