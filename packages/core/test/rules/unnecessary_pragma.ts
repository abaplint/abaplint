import {testRule} from "./_utils";
import {UnnecessaryPragma, UnnecessaryPragmaConf} from "../../src/rules/unnecessary_pragma";
import {MemoryFile, Registry} from "../../src";
import {expect} from "chai";

async function findIssues(abap: string, filename?: string, conf?: UnnecessaryPragmaConf) {
  const reg = new Registry().addFile(new MemoryFile(filename || "zunn.prog.abap", abap));
  await reg.parseAsync();
  const rule = new UnnecessaryPragma();
  rule.setConfig(conf || {});
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

const tests = [
  {abap: `parser error`, cnt: 0},

  {abap: `
    TRY.
      CATCH zcx_abapgit_exception ##no_handler.
        RETURN. "previous XML version or no IDoc segment
    ENDTRY.`, cnt: 1},

  {abap: `
    TRY.
      CATCH cx_sy_dyn_call_illegal_method ##NO_HANDLER.
* SICF might not be supported in some systems, assume this code is not called
    ENDTRY.`, cnt: 0},

  {abap: `
    TRY.
      CATCH zcx_abapgit_cancel ##NO_HANDLER.
        " Do nothing = gc_event_state-no_more_act
      CATCH zcx_abapgit_exception INTO lx_exception.
        ROLLBACK WORK.
        handle_error( lx_exception ).
    ENDTRY.`, cnt: 0},

  {abap: `
TRY.
CATCH zcx_abapgit_exception.                      "#EC NO_HANDLER
  cl_abap_unit_assert=>fail( ).
ENDTRY.`, cnt: 1},

  {abap: `
TRY.
CATCH zcx_abapgit_exception.
  cl_abap_unit_assert=>fail( ).
ENDTRY.`, cnt: 0},

  {abap: `WRITE 'hello' ##NO_TEXT.`, cnt: 0},
  {abap: `TABLES nast ##NEEDED.`, cnt: 0},
  {abap: `MESSAGE w125(zbar) WITH c_foo INTO message ##NO_TEXT.`, cnt: 1},
  {abap: `MESSAGE w125(zbar) WITH c_foo INTO message.`, cnt: 0},
  {abap: `MESSAGE w125(zbar) WITH c_foo INTO message ##NEEDED ##NO_TEXT.`, cnt: 2},

  {abap: `SELECT SINGLE * FROM tadir INTO @DATA(sdfs) ##SUBRC_OK.
IF sy-subrc <> 0.
ENDIF.`, cnt: 1},
  {abap: `SELECT SINGLE * FROM tadir INTO @DATA(sdfs).
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: `FORM entry USING return_code TYPE i us_screen   TYPE abap_bool ##NEEDED.
ENDFORM.`, cnt: 0},
];

testRule(tests, UnnecessaryPragma);

describe("Rule: unnecessary_pragma", () => {

  it("NO_TEXT added by SE24, one issue in default config", async () => {
    const abap = `
CLASS zcl_unn DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CONSTANTS gc_type TYPE i VALUE 3 ##NO_TEXT.
ENDCLASS.
CLASS zcl_unn IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap, "zcl_unn.clas.abap");
    expect(issues.length).to.equal(1);
  });

  it("NO_TEXT added by SE24, one issue in default config", async () => {
    const abap = `
CLASS zcl_unn DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CONSTANTS gc_type TYPE i VALUE 3 ##NO_TEXT.
ENDCLASS.
CLASS zcl_unn IMPLEMENTATION.
ENDCLASS.`;
    const issues = await findIssues(abap, "zcl_unn.clas.abap", {allowNoTextGlobal: true});
    expect(issues.length).to.equal(0);
  });

  it("Skip macros", async () => {
    const abap = `
REPORT zfoobar.

define unnecessary_pragma.
  try.
    catch cx_root.                                    "#EC NO_HANDLER
  endtry.
end-of-definition.`;
    const issues = await findIssues(abap, "zfoobar.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("BEGIN DATA", async () => {
    const abap = `
DATA: BEGIN OF blah ##NEEDED,
          test  TYPE string,
          test2 TYPE string,
        END OF blah.`;
    const issues = await findIssues(abap, "zfoobar.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("BEGIN CONSTANTS", async () => {
    const abap = `
CONSTANTS: BEGIN OF c_pragma_test ##NEEDED,
             test TYPE string VALUE 'test',
             test2 TYPE string VALUE 'test2',
           END OF c_pragma_test.`;
    const issues = await findIssues(abap, "zfoobar.prog.abap");
    expect(issues.length).to.equal(0);
  });

});