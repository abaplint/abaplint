import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {DefinitionsInModule} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new DefinitionsInModule();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: definitions_in_module", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("no definitions in module, no issues expected", async () => {
    const issues = await findIssues(`REPORT zfoo.
DATA foo TYPE i.
MODULE init_2000 OUTPUT.
  foo = 2.
ENDMODULE.`);
    expect(issues.length).to.equal(0);
  });

  it("DATA inside module", async () => {
    const issues = await findIssues(`REPORT zfoo.
MODULE init_2000 OUTPUT.
  DATA: lt_field_cat TYPE i.
ENDMODULE.`);
    expect(issues.length).to.equal(1);
  });

  it("TYPES inside module", async () => {
    const issues = await findIssues(`REPORT zfoo.
MODULE init_2000 INPUT.
  TYPES ty_foo TYPE i.
ENDMODULE.`);
    expect(issues.length).to.equal(1);
  });

  it("CONSTANTS inside module", async () => {
    const issues = await findIssues(`REPORT zfoo.
MODULE init_2000 OUTPUT.
  CONSTANTS c_foo TYPE i VALUE 2.
ENDMODULE.`);
    expect(issues.length).to.equal(1);
  });
});
