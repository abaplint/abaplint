import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {MainFileContents} from "../../src/rules";

function findIssues(abap: string, filename: string) {
  const reg = new Registry().addFile(new MemoryFile(filename, abap)).parse();
  const rule = new MainFileContents();
  return rule.initialize(reg).run(reg.getObjects()[0]);
}

describe("Rule: main_file_contents", () => {
  it("PROG parser error should not report issues", () => {
    const abap = "parser error";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG should start with REPORT, issue", () => {
    const abap = "WRITE hello.";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG should start with REPORT, solved", () => {
    const abap = "REPORT zreport.";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG should start with REPORT or PROGRAM, solved", () => {
    const abap = "PROGRAM zreport.";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG should start with REPORT, solved, comment ok", () => {
    const abap = "* foo\nREPORT zreport.";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG should start with REPORT, solved, two comments", () => {
    const abap = "* foo\n* bar\nREPORT zreport.";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("just a comment", () => {
    const abap = "* foo";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG should have name", () => {
    const abap = "REPORT.";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG report name should match filename", () => {
    const abap = "REPORT zmoo.";
    const issues = findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

});