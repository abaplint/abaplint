import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {CyclomaticComplexity} from "../../src/rules/cyclomatic_complexity";

async function runSingle(abap: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  return new CyclomaticComplexity().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: cyclomatic complexity", () => {

  it("test1", async () => {
    const abap = "parser error";
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(0);
  });

  it("max reached", async () => {
    let abap = `
    CLASS foo DEFINITION.
      PUBLIC SECTION.
        METHODS foobar.
    ENDCLASS.
    CLASS foo IMPLEMENTATION.
      METHOD foobar.`;
    for (let i = 0; i < 100; i++) {
      abap = abap + `IF 1 = 3.
      ENDIF.`;
    }
    abap = abap + `
      ENDMETHOD.
    ENDCLASS.`;
    const issues = await runSingle(abap);
    expect(issues.length).to.equal(1);
  });

});