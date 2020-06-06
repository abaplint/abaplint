import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {PreferInline} from "../../src/rules";

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zprefer_inline.prog.abap", abap)).parse();
  const rule = new PreferInline();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: prefer_inline", () => {

  it("parser error", () => {
    const issues = findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("Simple data, no code", () => {
    const issues = findIssues("DATA foo TYPE i.");
    expect(issues.length).to.equal(0);
  });

  it("Simple, data in FORM", () => {
    const issues = findIssues(`
FORM foo.
  DATA foo TYPE i.
  foo = 2.
ENDFORM.`);
    expect(issues.length).to.equal(1);
  });

});
