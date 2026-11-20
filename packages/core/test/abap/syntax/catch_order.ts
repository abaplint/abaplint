import {expect} from "chai";
import {Issue} from "../../../src/issue";
import {runMulti, runProgram} from "./syntax";

function runLocal(catches: string): Issue[] {
  return runProgram(`
CLASS cx_root DEFINITION.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.

CLASS cx_static_check DEFINITION INHERITING FROM cx_root.
ENDCLASS.
CLASS cx_static_check IMPLEMENTATION.
ENDCLASS.

CLASS lcx_base DEFINITION INHERITING FROM cx_static_check.
ENDCLASS.
CLASS lcx_base IMPLEMENTATION.
ENDCLASS.

CLASS lcx_sub DEFINITION INHERITING FROM lcx_base.
ENDCLASS.
CLASS lcx_sub IMPLEMENTATION.
ENDCLASS.

CLASS lcx_subsub DEFINITION INHERITING FROM lcx_sub.
ENDCLASS.
CLASS lcx_subsub IMPLEMENTATION.
ENDCLASS.

CLASS lcx_other DEFINITION INHERITING FROM cx_static_check.
ENDCLASS.
CLASS lcx_other IMPLEMENTATION.
ENDCLASS.

START-OF-SELECTION.
  DATA lv TYPE i.
  TRY.
      lv = 1.
${catches}
  ENDTRY.`);
}

function runGlobal(catches: string): Issue[] {
  return runMulti([
    {filename: "cx_root.clas.abap", contents: `
CLASS cx_root DEFINITION PUBLIC ABSTRACT CREATE PUBLIC.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.`},
    {filename: "cx_static_check.clas.abap", contents: `
CLASS cx_static_check DEFINITION PUBLIC INHERITING FROM cx_root ABSTRACT CREATE PUBLIC.
ENDCLASS.
CLASS cx_static_check IMPLEMENTATION.
ENDCLASS.`},
    {filename: "zcx_base.clas.abap", contents: `
CLASS zcx_base DEFINITION PUBLIC INHERITING FROM cx_static_check CREATE PUBLIC.
ENDCLASS.
CLASS zcx_base IMPLEMENTATION.
ENDCLASS.`},
    {filename: "zcx_not_found.clas.abap", contents: `
CLASS zcx_not_found DEFINITION PUBLIC INHERITING FROM zcx_base CREATE PUBLIC.
ENDCLASS.
CLASS zcx_not_found IMPLEMENTATION.
ENDCLASS.`},
    {filename: "zcl_run.clas.abap", contents: `
CLASS zcl_run DEFINITION PUBLIC CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.
CLASS zcl_run IMPLEMENTATION.
  METHOD run.
    TRY.
        run( ).
${catches}
    ENDTRY.
  ENDMETHOD.
ENDCLASS.`}]);
}

describe("syntax.ts, CATCH of a subclass after the CATCH of its superclass", () => {

  it("error, subclass after its direct superclass", () => {
    const issues = runLocal(`    CATCH lcx_base.
    CATCH lcx_sub.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH of LCX_SUB after the CATCH of its superclass LCX_BASE");
  });

  it("error, subclass after a superclass two levels up", () => {
    const issues = runLocal(`    CATCH cx_static_check.
    CATCH lcx_sub.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH of LCX_SUB after the CATCH of its superclass CX_STATIC_CHECK");
  });

  it("error, indirect subclass, BEFORE UNWIND, entry of a CATCH list", () => {
    const issues = runLocal(`    CATCH lcx_base.
    CATCH BEFORE UNWIND lcx_other lcx_subsub.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH of LCX_SUBSUB after the CATCH of its superclass LCX_BASE");
  });

  it("error, subclass after cx_root, INTO", () => {
    const issues = runLocal(`    CATCH cx_root INTO DATA(lx).
    CATCH lcx_other INTO lx.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH of LCX_OTHER after the CATCH of its superclass CX_ROOT");
  });

  it("error, global classes", () => {
    const issues = runGlobal(`      CATCH zcx_base.
      CATCH zcx_not_found.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH of ZCX_NOT_FOUND after the CATCH of its superclass ZCX_BASE");
  });

  it("error, global class after a superclass two levels up", () => {
    const issues = runGlobal(`      CATCH cx_static_check.
      CATCH zcx_not_found.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CATCH of ZCX_NOT_FOUND after the CATCH of its superclass CX_STATIC_CHECK");
  });

  it("ok, subclasses before their superclasses", () => {
    const issues = runLocal(`    CATCH lcx_subsub.
    CATCH lcx_sub.
    CATCH lcx_base.
    CATCH cx_static_check.
    CATCH cx_root.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, global classes in the right order", () => {
    const issues = runGlobal(`      CATCH zcx_not_found.
      CATCH zcx_base.
      CATCH cx_static_check.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, unrelated classes", () => {
    const issues = runLocal(`    CATCH lcx_other.
    CATCH lcx_sub.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, void classes", () => {
    const issues = runLocal(`    CATCH cx_sy_arithmetic_error.
    CATCH cx_sy_zerodivide.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, void class after a known class", () => {
    const issues = runLocal(`    CATCH cx_static_check.
    CATCH cx_sy_itab_line_not_found.`);
    expect(issues.length).to.equal(0);
  });

  it("ok, superclass and subclass in different TRY blocks, nested TRY", () => {
    const issues = runLocal(`    CATCH lcx_base.
      TRY.
          lv = 2.
        CATCH lcx_sub.
      ENDTRY.`);
    expect(issues.length).to.equal(0);
  });

});
