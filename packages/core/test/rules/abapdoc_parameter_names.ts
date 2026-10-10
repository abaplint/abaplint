import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {AbapdocParameterNames} from "../../src/rules";

async function findIssues(definition: string, filename = "zcl_foobar.clas.abap"): Promise<readonly Issue[]> {
  const abap = filename.endsWith(".intf.abap") ? definition : definition + `
CLASS zcl_foobar IMPLEMENTATION.
ENDCLASS.`;
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new AbapdocParameterNames();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: abapdoc_parameter_names", () => {

  it("all documented parameters exist, ok", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! Does foo
    "! @parameter iv_foo | Foo
    "! @parameter ev_bar | Bar
    "!                     continued
    "! @parameter ct_tab | Table
    "! @parameter rv_res | Result
    "! @raising cx_static_check | Error
    METHODS foo
      IMPORTING iv_foo        TYPE i
      EXPORTING ev_bar        TYPE i
      CHANGING  ct_tab        TYPE string_table
      RETURNING VALUE(rv_res) TYPE i
      RAISING   cx_static_check.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("documented parameter does not exist", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("iv_bar");
    expect(issues[0].getStart().getRow()).to.equal(4);
  });

  it("method without parameters", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! Does foo
    "! @parameter iv_foo | Foo
    CLASS-METHODS foo.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
  });

  it("missing parameter documentation, ok", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_foo | Foo
    METHODS foo IMPORTING iv_foo TYPE i iv_bar TYPE i RETURNING VALUE(rv_res) TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("case insensitive, escaped names, VALUE and REFERENCE, ok", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter IV_FOO | Foo
    "! @parameter data | Data
    "! @parameter iv_ref|Reference
    "! @parameter !rv_res | Result
    METHODS foo
      IMPORTING VALUE(iv_foo)     TYPE i
                !data             TYPE i
                REFERENCE(iv_ref) TYPE i
      RETURNING VALUE(rv_res)     TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("parameter documented twice", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_foo | Foo
    "! @parameter IV_FOO | Foo again
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("more than once");
  });

  it("raising and exception lines are not checked", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @raising cx_foo | Foo
    "! @exception not_found | Not found
    METHODS foo.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("empty parameter name, left to rule abapdoc", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter | Foo
    METHODS foo.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("interface method", async () => {
    const issues = await findIssues(`
INTERFACE zif_foobar PUBLIC.
  "! @parameter iv_foo | Foo
  "! @parameter iv_old | Old
  METHODS foo IMPORTING iv_foo TYPE i.
ENDINTERFACE.`, "zif_foobar.intf.abap");
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("iv_old");
  });

  it("local class", async () => {
    const issues = await findIssues(`
CLASS lcl_foo DEFINITION.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.
CLASS lcl_foo IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`, "zfoobar.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("event handler parameters, ok", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter sender | Sender
    METHODS on_click FOR EVENT click OF cl_gui_toolbar IMPORTING sender.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("event handler, unknown parameter", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter fcode | Function code
    METHODS on_click FOR EVENT click OF cl_gui_toolbar IMPORTING sender.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
  });

  it("RAP handler parameters", async () => {
    const issues = await findIssues(`
CLASS lhc_foo DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    "! @parameter keys | Keys
    "! @parameter requested_features | Requested
    "! @parameter result | Result
    "! @parameter failed | Failed
    METHODS get_instance_features FOR INSTANCE FEATURES
      IMPORTING keys REQUEST requested_features FOR zi_foo RESULT result.
ENDCLASS.
CLASS lhc_foo IMPLEMENTATION.
  METHOD get_instance_features.
  ENDMETHOD.
ENDCLASS.`, "zfoobar.prog.abap");
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("failed");
  });

  it("chained methods, each member has its own block", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS:
      "! @parameter iv_foo | Foo
      foo IMPORTING iv_foo TYPE i,
      "! @parameter iv_foo | Foo
      bar IMPORTING iv_bar TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(7);
  });

  it("block in front of chain keyword, left to wrong_abapdoc_position", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar
    METHODS:
      foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("block inside the statement, left to wrong_abapdoc_position", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS foo
      "! @parameter iv_bar | Bar
      IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("comments inside the statement are skipped", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar
    METHODS foo
      IMPORTING
        " obsolete
        iv_foo TYPE i
        "! @parameter iv_foo | Foo
        iv_baz TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(4);
  });

  it("block not directly in front of the method", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar
    DATA mv_foo TYPE i.
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("blank line between block and method, not attached", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar

    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("blank line inside the block, only the lower part is attached", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar

    "! @parameter iv_baz | Baz
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("iv_baz");
  });

  it("plain comment between block and method, not attached", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_bar | Bar
    " note
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("block of the previous method is not used", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! @parameter iv_foo | Foo
    METHODS foo IMPORTING iv_foo TYPE i.
    METHODS bar IMPORTING iv_bar TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

  it("normal comments are ignored", async () => {
    const issues = await findIssues(`
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    " @parameter iv_bar | Bar
    METHODS foo IMPORTING iv_foo TYPE i.
ENDCLASS.`);
    expect(issues.length).to.equal(0);
  });

});
