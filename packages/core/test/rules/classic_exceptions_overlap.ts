import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ClassicExceptionsOverlap} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, filename: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new ClassicExceptionsOverlap();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: classic_exceptions_overlap", () => {

  it("parser error", async () => {
    const abap = "parser error";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("error", async () => {
    const abap = `
    CALL FUNCTION 'SDFSD'
    EXCEPTIONS
    system_failure        = 1 MESSAGE lv_message
    communication_failure = 1 MESSAGE lv_message
    resource_failure      = 1
    OTHERS                = 1.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("fixed", async () => {
    const abap = `
    CALL FUNCTION 'SDFSD'
    EXCEPTIONS
    system_failure        = 1 MESSAGE lv_message
    communication_failure = 2 MESSAGE lv_message
    resource_failure      = 3
    OTHERS                = 4.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

});