import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {WrongAbapdocPosition} from "../../src/rules";
import {testRuleFix} from "./_utils";

async function findIssues(abap: string, filename = "zcl_foobar.clas.abap"): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new WrongAbapdocPosition();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: wrong_abapdoc_position", () => {

  it("in front of chain keyword", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! Navigation modes
    CONSTANTS:
      BEGIN OF cs_nav_mode,
        back TYPE i VALUE 1,
      END OF cs_nav_mode.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("chained");
  });

  it("after chain keyword, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    CONSTANTS:
      "! Navigation modes
      BEGIN OF cs_nav_mode,
        back TYPE i VALUE 1,
      END OF cs_nav_mode.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("in front of non chained declaration, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! documentation
    DATA mv_foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("in front of chained DATA", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! documentation
    DATA: mv_foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("in front of second chain member, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA: mv_foo TYPE i,
          "! documentation
          mv_bar TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("between parameters of METHODS", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS foo
      IMPORTING
        iv_one TYPE i
        "! documentation
        iv_two TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("inside statement");
  });

  it("inside chained METHODS member", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS:
      foo
        IMPORTING
          iv_one TYPE i
          "! documentation
          iv_two TYPE i,
      bar.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("in front of first chained METHODS member, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS:
      "! documentation
      foo,
      bar.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("in front of ENDCLASS", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA mv_foo TYPE i.
    "! documentation
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("does not document anything");
  });

  it("in front of ENDINTERFACE", async () => {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  METHODS foo.
  "! documentation
ENDINTERFACE.`;
    const issues = await findIssues(abap, "zif_foobar.intf.abap");
    expect(issues.length).to.equal(1);
  });

  it("in front of SECTION", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA mv_foo TYPE i.
    "! documentation
  PROTECTED SECTION.
    DATA mv_bar TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("in front of CLASS DEFINITION, ok", async () => {
    const abap = `
"! documentation
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA mv_foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("in front of INTERFACE, ok", async () => {
    const abap = `
"! documentation
INTERFACE zif_foobar PUBLIC.
  METHODS foo.
ENDINTERFACE.`;
    const issues = await findIssues(abap, "zif_foobar.intf.abap");
    expect(issues.length).to.equal(0);
  });

  it("multi row block, one issue", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! line one
    "! line two
    CONSTANTS:
      BEGIN OF cs_nav_mode,
        back TYPE i VALUE 1,
      END OF cs_nav_mode.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(4);
  });

  it("normal comment in front of chain, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    " normal comment
    CONSTANTS:
      BEGIN OF cs_nav_mode,
        back TYPE i VALUE 1,
      END OF cs_nav_mode.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("inside method implementation, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS foo.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
    "! not really abapdoc
    WRITE: / 'hello'.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("local class in report", async () => {
    const abap = `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    "! documentation
    TYPES:
      BEGIN OF ty_foo,
        bar TYPE i,
      END OF ty_foo.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap, "zfoo.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("blank line between block and declaration", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! what it answers

    METHODS run.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("by a blank line");
    expect(issues[0].getStart().getRow()).to.equal(4);
    expect(issues[0].getDefaultFix()).to.not.equal(undefined);
  });

  it("blank line inside block", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! first part
    "! more first part

    "! second part
    METHODS run.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("by a blank line");
    expect(issues[0].getStart().getRow()).to.equal(4);
  });

  it("normal comment between block and declaration", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! Called after the navigation.
    "! more text
    " note for whoever edits the framework
    METHODS check_on_navigated.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD check_on_navigated.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("by a comment");
    expect(issues[0].getStart().getRow()).to.equal(4);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
  });

  it("star comment between block and declaration", async () => {
    const abap = `
INTERFACE zif_foobar PUBLIC.
  "! documentation
* note
  METHODS foo.
ENDINTERFACE.`;
    const issues = await findIssues(abap, "zif_foobar.intf.abap");
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("by a comment");
  });

  it("blank line between block and CLASS DEFINITION", async () => {
    const abap = `
"! documentation

CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("by a blank line");
  });

  it("blank line inside block in front of INTERFACE", async () => {
    const abap = `
"! first part

"! second part
INTERFACE zif_foobar PUBLIC.
  METHODS foo.
ENDINTERFACE.`;
    const issues = await findIssues(abap, "zif_foobar.intf.abap");
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(2);
  });

  it("blank line after block in front of ENDCLASS, keeps message", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA mv_foo TYPE i.
    "! documentation

ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("does not document anything");
  });

  it("normal comment above block, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    " normal comment

    "! line one
    "! line two
    METHODS run.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("comments between the parameters of the declaration, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! documentation
    "! more documentation
    METHODS foo
      IMPORTING
        iv_one TYPE i

        " normal comment
        iv_two TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("trailing comment after a declaration, then blank line, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    DATA mv_foo TYPE i. "! trailing

    DATA mv_bar TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("pragma line between block and declaration, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! documentation
    ##NEEDED
    DATA mv_foo TYPE i.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("blank line in front of FORM, ok", async () => {
    const abap = `
"! documentation

FORM foo.
ENDFORM.`;
    const issues = await findIssues(abap, "zfoo.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("blank line inside method implementation, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS foo.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD foo.
    "! not really abapdoc

    WRITE: / 'hello'.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});

testRuleFix([{
  input: `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    "! documentation


    METHODS run.
ENDCLASS.`,
  output: `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    "! documentation
    METHODS run.
ENDCLASS.`,
}, {
  input: `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    "! first part

    "! second part
    METHODS run.
ENDCLASS.`,
  output: `
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    "! first part
    "! second part
    METHODS run.
ENDCLASS.`,
}, {
  input: `
"! documentation

CLASS lcl_foo DEFINITION.
ENDCLASS.`,
  output: `
"! documentation
CLASS lcl_foo DEFINITION.
ENDCLASS.`,
}], WrongAbapdocPosition);
