import {expect} from "chai";
import {Registry} from "../../src";
import {UnnecessaryReturn, UnnecessaryReturnConf} from "../../src/rules";
import {testRuleFixCount} from "./_utils";
import {MemoryFile} from "../../src/files/memory_file";

async function findIssues(abap: string, config?: UnnecessaryReturnConf) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new UnnecessaryReturn();
  if (config) {
    rule.setConfig(config);
  }
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

function testFix(input: string, expected: string) {
  testRuleFixCount(input, expected, new UnnecessaryReturn());
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

  it("test FORM, ok via config", async () => {
    const abap = `
FORM foo.
  RETURN.
ENDFORM.`;

    const config = new UnnecessaryReturnConf();
    config.allowEmpty = true;
    const issues = await findIssues(abap, config);
    expect(issues.length).to.equal(0);
  });

  it("test FORM, ok via config, with comment", async () => {
    const abap = `
FORM foo.
* hello world
  RETURN.
ENDFORM.`;

    const config = new UnnecessaryReturnConf();
    config.allowEmpty = true;
    const issues = await findIssues(abap, config);
    expect(issues.length).to.equal(0);
  });

  it("test FORM fix", async () => {
    const abap = `
FORM foo.
RETURN.
ENDFORM.`;
    const expected = `
FORM foo.

ENDFORM.`;
    testFix(abap, expected);
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

  it("test IF, no issue", async () => {
    const abap = `
FORM foo.
  IF 1 = 2.
    RETURN.
  ENDIF.
  WRITE 'sdf'.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});