import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {NoPrefixes} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(code: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("foobar.prog.abap", code));
  await reg.parseAsync();
  const rule = new NoPrefixes();
  return rule.run(reg.getFirstObject()!);
}

describe("Rule: no_prefixes", () => {

  it("syntax error, no issues", async () => {
    const abap = `syntax error`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("DATA, error", async () => {
    const abap = `DATA lv_foo TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("DATA, error, fixed", async () => {
    const abap = `DATA foo TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("DATA, error, inline", async () => {
    const abap = `DATA(lv_foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("DATA, error, inline, fixed", async () => {
    const abap = `DATA(foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("FINAL, error, inline", async () => {
    const abap = `FINAL(lv_foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("FINAL, error, inline, fixed", async () => {
    const abap = `FINAL(foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("FIELD-SYMBOLS, error", async () => {
    const abap = `FIELD-SYMBOLS <lv_foo> TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("FIELD-SYMBOLS, fixed", async () => {
    const abap = `FIELD-SYMBOLS <foo> TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("TYPES", async () => {
    const abap = `TYPES ty_foo TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});
