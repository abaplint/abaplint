import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {OmitParameterName} from "../../src/rules";
import {Issue} from "../../src/issue";
import {testRuleFixSingle} from "./_utils";

async function findIssues(abap: string, filename: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new OmitParameterName();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new OmitParameterName());
}

describe("Rule: omit_parameter_name", () => {
  it("parser error", async () => {
    const abap = "parser error";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("simple, one parameter", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( imp = 2 ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("simple, one parameter, local data same name as parameter", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  DATA imp TYPE i.
  lcl_bar=>bar( imp ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("fixed", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( 2 ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("simple, two OPTIONAL parameters", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING
      imp TYPE i OPTIONAL
      imp2 TYPE i OPTIONAL.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( imp = 2 ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("Two parameters supplied", async () => {
    const abap = `
INTERFACE zif_abaplint_code_inspector.
  METHODS run
    IMPORTING
      iv_variant TYPE sci_chkv
      iv_save    TYPE abap_bool DEFAULT abap_false.
endinterface.

FORM bar.
  DATA li_code_inspector TYPE REF TO zif_abaplint_code_inspector.
  li_code_inspector->run(
    iv_variant = |{ p_chkv }|
    iv_save    = abap_true ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("preferred parameter", async () => {
    const abap = `
INTERFACE zif_abaplint_code_inspector.
  METHODS run
    IMPORTING
      in1 TYPE string optional
      in2 type string optional
      PREFERRED PARAMETER in1.
endinterface.

FORM bar.
  DATA li_code_inspector TYPE REF TO zif_abaplint_code_inspector.
  li_code_inspector->run( in1 = |sdf| ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("preferred parameter, escaped", async () => {
    const abap = `
INTERFACE zif_abaplint_code_inspector.
  METHODS run
    IMPORTING
      in1 TYPE string optional
      in2 type string optional
      PREFERRED PARAMETER !in1.
endinterface.

FORM bar.
  DATA li_code_inspector TYPE REF TO zif_abaplint_code_inspector.
  li_code_inspector->run( in1 = |sdf| ).
ENDFORM.`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("built-in method", async () => {
    const abap = `
DATA foo TYPE string.
foo = 'hello'.
foo = to_upper( val = foo ).`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

});

describe("Rule: omit_parameter_name, quick fixes", () => {

  it("quick fix 1", async () => {
    const abap = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( imp = 2 ).
ENDFORM.`;
    const expected = `
CLASS lcl_bar DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS bar IMPORTING imp TYPE i.
ENDCLASS.
CLASS lcl_bar IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.

FORM bar.
  lcl_bar=>bar( 2 ).
ENDFORM.`;
    testFix(abap, expected);
  });

});