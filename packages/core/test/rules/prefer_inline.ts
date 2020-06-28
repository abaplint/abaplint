import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {PreferInline} from "../../src/rules";

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zprefer_inline.prog.abap", abap)).parse();
  const rule = new PreferInline();
  return rule.initialize(reg).run(reg.getObjects()[0]);
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
  DATA moo TYPE i.
  moo = 2.
ENDFORM.`);
    expect(issues.length).to.equal(1);
  });

  it("Already inline", () => {
    const issues = findIssues(`
FORM foo.
  DATA(moo) = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Defined outside FORM", () => {
    const issues = findIssues(`
DATA moo TYPE i.
FORM foo.
  moo = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Fist use is WRITE statement", () => {
    const issues = findIssues(`
FORM foo.
  DATA moo TYPE i.
  WRITE moo.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("No inlining for generic types", () => {
    const issues = findIssues(`
FORM foo.
  FIELD-SYMBOLS <foo> TYPE any.
  ASSIGN 2 TO <foo>.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("No inlining for void types", () => {
    const issues = findIssues(`
FORM foo.
  DATA sdf TYPE sdfsdfsdfsd.
  sdf = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("First write should be full/pure", () => {
    const issues = findIssues(`
FORM foo.
  DATA sdf TYPE sy.
  sdf-tabix = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it.skip("Types should not change when inlining", () => {
    const issues = findIssues(`
DATA foo TYPE c.
foo = |abc|.`);
    expect(issues.length).to.equal(0);
  });

});
