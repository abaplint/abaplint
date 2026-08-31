import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {ImplicitStartOfSelection} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new ImplicitStartOfSelection();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: implicit_start_of_selection", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues(`REPORT zfoo.
WRITE 'hello'.`);
    expect(issues.length).to.equal(1);
  });

  it("issue", async () => {
    const issues = await findIssues(`REPORT zfoo.
WRITE 'hello'.

END-OF-SELECTION.
  WRITE 'world'.`);
    expect(issues.length).to.equal(1);
  });

  it("fixed", async () => {
    const issues = await findIssues(`REPORT zfoo.
START-OF-SELECTION.
  WRITE 'hello'.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, GET", async () => {
    const issues = await findIssues(`REPORT zfoo.
GET mara.
  WRITE 'world'.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, FORM", async () => {
    const issues = await findIssues(`REPORT zfoo.

FORM foo.
ENDFORM.

START-OF-SELECTION.
  PERFORM foo.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, DEFINE", async () => {
    const issues = await findIssues(`REPORT zfoo.

DEFINE _foo.
END-OF-DEFINITION.

START-OF-SELECTION.
  _foo.`);
    expect(issues.length).to.equal(0);
  });

  it("okay", async () => {
    const issues = await findIssues(`REPORT zfoo.
TYPES bar TYPE i.

START-OF-SELECTION.
  WRITE 'world'.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, FIELD-SYMBOLS", async () => {
    const issues = await findIssues(`REPORT zfoo.
FIELD-SYMBOLS <gt_output> TYPE STANDARD TABLE.

START-OF-SELECTION.
  WRITE 'world'.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, RANGES", async () => {
    const issues = await findIssues(`REPORT zfoo.
RANGES gr_foo FOR sy-tabix.

START-OF-SELECTION.
  WRITE 'world'.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, STATICS", async () => {
    const issues = await findIssues(`REPORT zfoo.
STATICS sv_foo TYPE i.

STATICS BEGIN OF bar.
STATICS int TYPE i.
STATICS END OF bar.

START-OF-SELECTION.
  WRITE 'world'.`);
    expect(issues.length).to.equal(0);
  });

});
