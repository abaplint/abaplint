import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {AbapdocLeadingAt} from "../../src/rules";
import {testRule} from "./_utils";

function definition(abap: string): string {
  return `CLASS lcl_foo DEFINITION.\n  PUBLIC SECTION.\n${abap}\nENDCLASS.\nCLASS lcl_foo IMPLEMENTATION.\nENDCLASS.`;
}

function implementation(abap: string): string {
  return `CLASS lcl_foo DEFINITION.\n  PUBLIC SECTION.\n    METHODS run.\nENDCLASS.\n`
    + `CLASS lcl_foo IMPLEMENTATION.\n  METHOD run.\n${abap}\n  ENDMETHOD.\nENDCLASS.`;
}

testRule([
  {abap: `INTERFACE lif_foo.\n  "! @UI.facet\n  DATA mv_foo TYPE string.\nENDINTERFACE.`, cnt: 1},
  {abap: definition(`"! the first of\n"! @UI.presentationVariant sortOrder\nDATA mv_sort_field TYPE string.`), cnt: 1},
  {abap: definition(`"! @ObjectModel.text.element\nDATA mv_text TYPE string.`), cnt: 1},
  {abap: definition(`"!   @Semantics.systemDateTime.createdAt\nDATA mv_created TYPE timestampl.`), cnt: 1},
  {abap: definition(`"!@UI.facet\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! @\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! @parameters wrong command\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! @UI.facet\n"! @UI.lineItem\nDATA mv_foo TYPE string.`), cnt: 2},
  {abap: definition(`"! the first of @UI.presentationVariant\n"! sortOrder\nDATA mv_sort_field TYPE string.`), cnt: 0},
  {abap: definition(`"! the @UI.facet entries\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`" @UI.facet\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`* @UI.facet\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! {@link zcl_foo}\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! mail me at foo@bar.com\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`DATA mv_foo TYPE string.`), cnt: 0},
  {abap: implementation(`    "! @UI.presentationVariant sortOrder\n    DATA lv_foo TYPE string.`), cnt: 0},
  {abap: `"! @UI.presentationVariant sortOrder\nDATA gv_foo TYPE string.`, cnt: 0},
  {abap: `FORM foo.\n  "! @UI.presentationVariant sortOrder\n  DATA lv_foo TYPE string.\nENDFORM.`, cnt: 0},
], AbapdocLeadingAt);

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zcl_foobar.clas.abap", abap));
  await reg.parseAsync();
  const rule = new AbapdocLeadingAt();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: abapdoc_leading_at", () => {

  it("commands, ok", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! Runs it
    "! @parameter iv_name | the name
    "! @parameter rv_result | the result
    "! @raising zcx_foo | when it fails
    METHODS run
      IMPORTING iv_name TYPE string
      RETURNING VALUE(rv_result) TYPE string
      RAISING zcx_foo.
    "! @exception not_found | nothing there
    "! @RAISING zcx_bar | any case is accepted
    METHODS old EXCEPTIONS not_found.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
  METHOD old.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("annotation at start of line in class definition", async () => {
    const abap = `
CLASS zcl_foobar DEFINITION PUBLIC.
  PUBLIC SECTION.
    "! the first of
    "! @UI.presentationVariant sortOrder
    DATA mv_sort_field TYPE string.
    METHODS run
      "! @ObjectModel.text.element
      IMPORTING iv_name TYPE string.
ENDCLASS.
CLASS zcl_foobar IMPLEMENTATION.
  METHOD run.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(2);
    expect(issues[0].getStart().getRow()).to.equal(5);
    expect(issues[0].getMessage()).to.contain(`A command was expected after ABAP Doc symbol "@"`);
    expect(issues[1].getStart().getRow()).to.equal(8);
  });

});
