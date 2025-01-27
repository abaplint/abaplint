import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {EmptyEvent} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new EmptyEvent();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: empty_event", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues(`REPORT zfoo.
START-OF-SELECTION.
  PERFORM sdf.
  COMMIT WORK.
END-OF-SELECTION.`);
    expect(issues.length).to.equal(1);
  });

  it("issue", async () => {
    const issues = await findIssues(`REPORT zfoo.
START-OF-SELECTION.
  PERFORM sdf.
  COMMIT WORK.
END-OF-SELECTION.

FORM foo.
ENDFORM.`);
    expect(issues.length).to.equal(1);
  });

  it("ok", async () => {
    const issues = await findIssues(`REPORT zfoo.
START-OF-SELECTION.
  PERFORM sdf.
  COMMIT WORK.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, try", async () => {
    const issues = await findIssues(`REPORT zfoo.

START-OF-SELECTION.
  TRY.
  ENDTRY.

FORM foo.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("multiple", async () => {
    const issues = await findIssues(`REPORT zfoo.
START-OF-SELECTION.
END-OF-SELECTION.
TOP-OF-PAGE.`);
    expect(issues.length).to.equal(3);
  });

  it("load of program", async () => {
    const issues = await findIssues(`REPORT zfoo.
LOAD-OF-PROGRAM.`);
    expect(issues.length).to.equal(1);
  });

});
