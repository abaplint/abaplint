import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {PreferInline} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zprefer_inline.prog.abap", abap));
  await reg.parseAsync();
  const rule = new PreferInline();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: prefer_inline", () => {

  it("parser error", async () => {
    const issues = await findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("Simple data, no code", async () => {
    const issues = await findIssues("DATA foo TYPE i.");
    expect(issues.length).to.equal(0);
  });

  it("Simple, data in FORM", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA moo TYPE i.
  moo = 2.
ENDFORM.`);
    expect(issues.length).to.equal(1);
  });

  it("Already inline", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA(moo) = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Defined outside FORM", async () => {
    const issues = await findIssues(`
DATA moo TYPE i.
FORM foo.
  moo = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Fist use is WRITE statement", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA moo TYPE i.
  WRITE moo.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("No inlining for generic types", async () => {
    const issues = await findIssues(`
FORM foo.
  FIELD-SYMBOLS <foo> TYPE any.
  ASSIGN 2 TO <foo>.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("No inlining for void types", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA sdf TYPE sdfsdfsdfsd.
  sdf = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("First write should be full/pure", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA sdf TYPE sy.
  sdf-tabix = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it.skip("Types should not change when inlining", async () => {
    const issues = await findIssues(`
DATA foo TYPE c.
foo = |abc|.`);
    expect(issues.length).to.equal(0);
  });

});
