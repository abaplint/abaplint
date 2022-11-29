import {expect} from "chai";
import {MemoryFile, Registry} from "../../src";
import {UnnecessaryReturn} from "../../src/rules";

async function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new UnnecessaryReturn();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: unnecessary_return", () => {

  it("parser error", async () => {
    const abap = `dsflkjdsflkjfds ljdsfds`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("test FORM", async () => {
    const abap = `
FORM foo.
  RETURN.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("test METHOD", async () => {
    const abap = `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS foo.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD foo.
    DATA sdf TYPE i.
    RETURN.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("test IF", async () => {
    const abap = `
FORM foo.
  IF 1 = 2.
    RETURN.
  ENDIF.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

});