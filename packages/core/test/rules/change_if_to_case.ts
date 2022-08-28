import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {ChangeIfToCase} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new ChangeIfToCase();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: change_if_to_case", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("No issue, single if", async () => {
    const issues = await findIssues(`
    IF l_fcat-fieldname EQ 'ASDF'.
    ENDIF.`);
    expect(issues.length).to.equal(0);
  });

  it("issue found", async () => {
    const issues = await findIssues(`
    IF l_fcat-fieldname EQ 'ASDF'.
    ELSEIF l_fcat-fieldname = 'EWRWEW'
        OR l_fcat-fieldname = 'JHGHJHG'
        OR l_fcat-fieldname = 'QWERWQE'.
    ELSE.
    ENDIF.`);
    expect(issues.length).to.equal(1);
  });

  it("issue found, without ELSE", async () => {
    const issues = await findIssues(`
    IF l_fcat-fieldname EQ 'ASDF'.
    ELSEIF l_fcat-fieldname = 'EWRWEW'
        OR l_fcat-fieldname = 'JHGHJHG'
        OR l_fcat-fieldname = 'QWERWQE'.
    ENDIF.`);
    expect(issues.length).to.equal(1);
  });

  it("AND, no issue", async () => {
    const issues = await findIssues(`
    IF l_fcat-fieldname EQ 'ASDF'.
    ELSEIF l_fcat-fieldname = 'EWRWEW'
        AND l_fcat-fieldname = 'JHGHJHG'
        OR l_fcat-fieldname = 'QWERWQE'.
    ENDIF.`);
    expect(issues.length).to.equal(0);
  });

  it("NE, no issue", async () => {
    const issues = await findIssues(`
    IF l_fcat-fieldname NE 'ASDF'.
    ELSEIF l_fcat-fieldname = 'EWRWEW'
        OR l_fcat-fieldname = 'JHGHJHG'
        OR l_fcat-fieldname = 'QWERWQE'.
    ENDIF.`);
    expect(issues.length).to.equal(0);
  });

  it("different field, no issue", async () => {
    const issues = await findIssues(`
    IF l_fcat-fieldname NE 'ASDF'.
    ELSEIF l_fcat-fieldname = 'EWRWEW'
        OR different = 'JHGHJHG'
        OR l_fcat-fieldname = 'QWERWQE'.
    ENDIF.`);
    expect(issues.length).to.equal(0);
  });

  it("issue, compare with variable", async () => {
    const issues = await findIssues(`
  IF type = type-some_type.
  ELSEIF type = type-some_other_type.
  ELSE.
  ENDIF.`);
    expect(issues.length).to.equal(1);
  });

  it("issue, compare with variable, mirrored", async () => {
    const issues = await findIssues(`
  IF type-some_type = type.
  ELSEIF type-some_other_type = type.
  ELSE.
  ENDIF.`);
    expect(issues.length).to.equal(1);
  });

  it("issue, compare with variable, mirrored", async () => {
    const issues = await findIssues(`
  IF type-some_type = type.
  ELSEIF type-some_other_type = type2.
  ELSE.
  ENDIF.`);
    expect(issues.length).to.equal(0);
  });

});
