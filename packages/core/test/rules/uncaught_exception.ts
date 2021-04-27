import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {UncaughtException} from "../../src/rules";
import {Issue} from "../../src/issue";

const cx_root = `CLASS cx_root DEFINITION PUBLIC.
ENDCLASS.
CLASS cx_root IMPLEMENTATION.
ENDCLASS.`;

const cx_static_check = `CLASS cx_static_check DEFINITION PUBLIC INHERITING FROM cx_root.
ENDCLASS.
CLASS cx_static_check IMPLEMENTATION.
ENDCLASS.`;

const cx_salv_not_found = `CLASS cx_salv_not_found DEFINITION PUBLIC INHERITING FROM cx_salv_error.
ENDCLASS.
CLASS cx_salv_not_found IMPLEMENTATION.
ENDCLASS.` ;

const cx_salv_error = `CLASS cx_salv_error DEFINITION PUBLIC INHERITING FROM cx_static_check.
ENDCLASS.
CLASS cx_salv_error IMPLEMENTATION.
ENDCLASS.`;

const ycx_object_not_processed = `class YCX_OBJECT_NOT_PROCESSED definition
  public
  inheriting from CX_STATIC_CHECK
  create public .
ENDCLASS.

CLASS YCX_OBJECT_NOT_PROCESSED IMPLEMENTATION.
ENDCLASS.`;


async function findIssues(abap: string, filename: string, extra: MemoryFile[] = []): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  reg.addFile(new MemoryFile("cx_root.clas.abap", cx_root));
  reg.addFile(new MemoryFile("cx_static_check.clas.abap", cx_static_check));
  reg.addFile(new MemoryFile("cx_salv_error.clas.abap", cx_salv_error));
  reg.addFile(new MemoryFile("cx_salv_not_found.clas.abap", cx_salv_not_found));
  reg.addFile(new MemoryFile("ycx_object_not_processed.clas.abap", ycx_object_not_processed));
  reg.addFiles(extra);
  await reg.parseAsync();
  const rule = new UncaughtException().initialize(reg);
  const issues: Issue[] = [];
  for (const o of reg.getObjects()) {
    issues.push(...rule.run(o));
  }
  return issues;
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

  it("Method with raise", async () => {
    const abap = `
  CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
  ENDCLASS.
  CLASS lcx_error IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl_class DEFINITION.
    PUBLIC SECTION.
      METHODS foobar.
  ENDCLASS.
  CLASS lcl_class IMPLEMENTATION.
    METHOD foobar.
      RAISE EXCEPTION TYPE lcx_error.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("Method with raise, fixed, propagate", async () => {
    const abap = `
  CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
  ENDCLASS.
  CLASS lcx_error IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl_class DEFINITION.
    PUBLIC SECTION.
      METHODS foobar RAISING lcx_error.
  ENDCLASS.
  CLASS lcl_class IMPLEMENTATION.
    METHOD foobar.
      RAISE EXCEPTION TYPE lcx_error.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("TRY without CATCH, no effect", async () => {
    const abap = `
    CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
    ENDCLASS.
    CLASS lcx_error IMPLEMENTATION.
    ENDCLASS.

    FORM bar.
      TRY.
        RAISE EXCEPTION TYPE lcx_error.
      ENDTRY.
    ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("fixed via TRY CATCH", async () => {
    const abap = `
    CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
    ENDCLASS.
    CLASS lcx_error IMPLEMENTATION.
    ENDCLASS.

    FORM bar.
      TRY.
        RAISE EXCEPTION TYPE lcx_error.
      CATCH lcx_error.
        RETURN.
      ENDTRY.
    ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("error derived method call, in method 'moo'", async () => {
    const abap = `
  CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
  ENDCLASS.
  CLASS lcx_error IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl_class DEFINITION.
    PUBLIC SECTION.
      METHODS moo.
      METHODS foobar RAISING lcx_error.
  ENDCLASS.
  CLASS lcl_class IMPLEMENTATION.
    METHOD moo.
      foobar( ).
    ENDMETHOD.
    METHOD foobar.
      RAISE EXCEPTION TYPE lcx_error.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it.skip("no error, super classed, local exceptions", async () => {
    const abap = `
  CLASS lcx_error DEFINITION INHERITING FROM cx_static_check.
  ENDCLASS.
  CLASS lcx_error IMPLEMENTATION.
  ENDCLASS.

  CLASS lcx_sub DEFINITION INHERITING FROM lcx_error.
  ENDCLASS.
  CLASS lcx_sub IMPLEMENTATION.
  ENDCLASS.

  CLASS lcl_class DEFINITION.
    PUBLIC SECTION.
      METHODS foobar RAISING lcx_error.
  ENDCLASS.
  CLASS lcl_class IMPLEMENTATION.
    METHOD foobar.
      RAISE EXCEPTION TYPE lcx_sub.
    ENDMETHOD.
  ENDCLASS.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("caught via super", async () => {
    const abap = `
REPORT zfoobar.
CLASS lcl_alv DEFINITION.
  PUBLIC SECTION.
    METHODS set_text
      RAISING
        cx_salv_not_found.
    METHODS show_alv.
ENDCLASS.

CLASS lcl_alv IMPLEMENTATION.

  METHOD set_text.
    RETURN.
  ENDMETHOD.

  METHOD show_alv.
    DATA: lx_error TYPE REF TO cx_root.

    TRY.
        set_text( ).
      CATCH cx_root INTO lx_error.
* cx_root is a parent of cx_salv_not_found
    ENDTRY.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("Method with raise, expect error", async () => {
    const abap = `
    CLASS lcl_file DEFINITION.
    PUBLIC SECTION.
      CLASS-METHODS download.
  ENDCLASS.

  CLASS lcl_file IMPLEMENTATION.
    METHOD download.
      RAISE EXCEPTION TYPE ycx_object_not_processed.
    ENDMETHOD.
  ENDCLASS.`;
    const file = new MemoryFile("zreport.prog.abap", `INCLUDE zinclude.`);
    const issues = await findIssues(abap, "zinclude.prog.abap", [file]);
    expect(issues.length).to.equal(1);
  });

  it("Method with raise, fixed", async () => {
    const abap = `
  CLASS lcl_file DEFINITION.
    PUBLIC SECTION.
      CLASS-METHODS download RAISING ycx_object_not_processed cx_abap_invalid_value.
  ENDCLASS.

  CLASS lcl_file IMPLEMENTATION.
    METHOD download.
      RAISE EXCEPTION TYPE ycx_object_not_processed.
    ENDMETHOD.
  ENDCLASS.`;
    const file = new MemoryFile("zreport.prog.abap", `INCLUDE zinclude.`);
    const issues = await findIssues(abap, "zinclude.prog.abap", [file]);
    expect(issues.length).to.equal(0);
  });

  it("PROG with INCL, INCL should be skipped", async () => {
    const progabap = `
    REPORT ytop.
    INCLUDE ysub.`;
    const inclabap = `CLASS lcl_file DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS download RAISING cx_static_check.
ENDCLASS.
CLASS lcl_file IMPLEMENTATION.
  METHOD download.
    RAISE EXCEPTION TYPE cx_static_check.
  ENDMETHOD.
ENDCLASS.`;
    const inclxml = `<SUBC>I</SUBC>`;
    const sub1 = new MemoryFile("ysub.prog.abap", inclabap);
    const sub2 = new MemoryFile("ysub.prog.xml", inclxml);
    const issues = await findIssues(progabap, "ytop.prog.abap", [sub1, sub2]);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

  // todo, the INCLUDE should be expanded when traversing the structure
  it.skip("PROG with INCL, expect error", async () => {
    const progabap = `
    REPORT ytop.
    INCLUDE ysub.`;
    const inclabap = `CLASS lcl_file DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS download.
ENDCLASS.
CLASS lcl_file IMPLEMENTATION.
  METHOD download.
    RAISE EXCEPTION TYPE cx_static_check.
  ENDMETHOD.
ENDCLASS.`;
    const inclxml = `<SUBC>I</SUBC>`;
    const sub1 = new MemoryFile("ysub.prog.abap", inclabap);
    const sub2 = new MemoryFile("ysub.prog.xml", inclxml);
    const issues = await findIssues(progabap, "ytop.prog.abap", [sub1, sub2]);
    expect(issues.length).to.equal(1);
  });

});