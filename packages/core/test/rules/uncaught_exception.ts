import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {UncaughtException} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, filename: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new UncaughtException();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: uncaught_exception", () => {

  it("PROG parser error, no issues expected", async () => {
    const abap = "parser error";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG no issue", async () => {
    const abap = "WRITE 2.";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG, no error at top level", async () => {
    const abap = `
  CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
  ENDCLASS.
  CLASS lcx_error IMPLEMENTATION.
  ENDCLASS.
  RAISE EXCEPTION TYPE lcx_error.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("PROG, error for FORM", async () => {
    const abap = `
    CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
    ENDCLASS.
    CLASS lcx_error IMPLEMENTATION.
    ENDCLASS.

    FORM bar.
      RAISE EXCEPTION TYPE lcx_error.
    ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("PROG, FORM fixed", async () => {
    const abap = `
    CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
    ENDCLASS.
    CLASS lcx_error IMPLEMENTATION.
    ENDCLASS.

    FORM bar RAISING lcx_error.
      RAISE EXCEPTION TYPE lcx_error.
    ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

});