import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (classes: string, names: string): string => `
REPORT zcatch.
${classes}
START-OF-SELECTION.
  TRY.
    CATCH ${names}.
  ENDTRY.`;

const ROOT = `
CLASS cx_root DEFINITION ABSTRACT.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.`;

const lclass = (name: string, superclass?: string) => `
CLASS ${name} DEFINITION${superclass ? " INHERITING FROM " + superclass : ""}.
ENDCLASS.
CLASS ${name} IMPLEMENTATION.
ENDCLASS.`;

describe("syntax.ts, CATCH of a class that is not an exception class", () => {

  it("error, class without superclass", () => {
    const issues = runProgram(program(lclass("lcl"), "lcl"));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH, LCL is not an exception class, it is not derived from CX_ROOT");
  });

  it("error, subclass of such a class", () => {
    const issues = runProgram(program(lclass("lcl") + lclass("lcl_sub", "lcl"), "lcl_sub"));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("LCL_SUB is not an exception class");
  });

  it("error, interface", () => {
    const issues = runProgram(program("INTERFACE lif.\nENDINTERFACE.", "lif"));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH, LIF is an interface, not an exception class");
  });

  it("error, the second class of the CATCH", () => {
    const issues = runProgram(program(ROOT + lclass("lcx", "cx_root") + lclass("lcl"), "lcx lcl"));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.include("LCL is not an exception class");
  });

  it("ok, CX_ROOT", () => {
    const issues = runProgram(program(ROOT, "cx_root"));
    expect(issues.length).to.equal(0);
  });

  it("ok, indirect subclass of CX_ROOT", () => {
    const issues = runProgram(program(ROOT + lclass("lcx", "cx_root") + lclass("lcx_sub", "lcx"), "lcx_sub"));
    expect(issues.length).to.equal(0);
  });

  // the unknown superclass is reported on its own
  const classIssues = (source: string) => runProgram(source).filter(i => i.getMessage().includes("exception class"));

  it("ok, subclass of an unknown CX_ROOT", () => {
    expect(classIssues(program(lclass("lcx", "cx_root"), "lcx")).length).to.equal(0);
  });

  it("ok, superclass chain ends in an unknown class", () => {
    const source = program(lclass("lcx", "cx_static_check") + lclass("lcx_sub", "lcx"), "lcx_sub");
    expect(classIssues(source).length).to.equal(0);
  });

  it("ok, void class", () => {
    const issues = runProgram(program("", "cx_sy_zerodivide"));
    expect(issues.length).to.equal(0);
  });

});
