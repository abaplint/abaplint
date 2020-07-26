import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {MainFileContents} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, filename: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new MainFileContents();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: main_file_contents", () => {
  it("PROG parser error should report issues", async () => {
    const abap = "parser error";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG should start with REPORT, issue", async () => {
    const abap = "WRITE hello.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG should start with REPORT, solved", async () => {
    const abap = "REPORT zreport.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG should start with REPORT or PROGRAM, solved", async () => {
    const abap = "PROGRAM zreport.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG should start with REPORT, solved, comment ok", async () => {
    const abap = "* foo\nREPORT zreport.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG should start with REPORT, solved, two comments", async () => {
    const abap = "* foo\n* bar\nREPORT zreport.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("just a comment", async () => {
    const abap = "* foo";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG should have name", async () => {
    const abap = "REPORT.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG report name should match filename", async () => {
    const abap = "REPORT zmoo.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

});