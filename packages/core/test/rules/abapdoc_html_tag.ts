import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {AbapdocHtmlTag} from "../../src/rules";
import {testRule} from "./_utils";

function definition(abap: string): string {
  return `CLASS lcl_foo DEFINITION.\n  PUBLIC SECTION.\n${abap}\nENDCLASS.\nCLASS lcl_foo IMPLEMENTATION.\nENDCLASS.`;
}

function implementation(abap: string): string {
  return `CLASS lcl_foo DEFINITION.\n  PUBLIC SECTION.\n    METHODS run.\nENDCLASS.\n`
    + `CLASS lcl_foo IMPLEMENTATION.\n  METHOD run.\n${abap}\n  ENDMETHOD.\nENDCLASS.`;
}

testRule([
  {abap: `INTERFACE lif_foo.\n  "! the <name>\n  DATA mv_foo TYPE string.\nENDINTERFACE.`, cnt: 1},
  {abap: definition(`"! Returns the <name> of the selected row\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! loops with <wa> and <ls_row>-field\nDATA mv_foo TYPE string.`), cnt: 2},
  {abap: definition(`"! navigates to #/app/<CLASS>\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! use a <Button> control\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! closing </name> only\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! self closing <name/>\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! <a href="x">link</a>\nDATA mv_foo TYPE string.`), cnt: 2},
  {abap: definition(`"! <code>x</code>\nDATA mv_foo TYPE string.`), cnt: 2},
  {abap: definition(`"! Returns the &lt;name&gt; of the selected row\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! Returns the name of the selected row\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! true if a < b and b > c\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! a <= b, a <> b, < 1 >\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <p class="shorttext synchronized" lang="en">Short text</p>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <em>one</em> <strong>two</strong><br/>three<br>four<br />\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <h1>a</h1><h2>b</h2><h3>c</h3>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <ul><li>a</li></ul><ol><li>b</li></ol>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <P>upper case</P> <EM>too</EM>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! {@link zcl_foo.meth:bar}\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`" Returns the <name> of the selected row\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`* Returns the <name> of the selected row\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: `FIELD-SYMBOLS <name> TYPE any.`, cnt: 0},
  {abap: implementation(`    "! Returns the <name> of the selected row\n    DATA lv_foo TYPE string.`), cnt: 0},
  {abap: `"! Returns the <name> of the selected row\nDATA gv_foo TYPE string.`, cnt: 0},
  {abap: `FORM foo.\n  "! Returns the <name> of the selected row\n  DATA lv_foo TYPE string.\nENDFORM.`, cnt: 0},
], AbapdocHtmlTag);

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap));
  await reg.parseAsync();
  const rule = new AbapdocHtmlTag();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: abapdoc_html_tag", () => {

  it("placeholders in interface", async () => {
    const abap = `INTERFACE zif_foobar PUBLIC.
  "! <p class="shorttext synchronized" lang="en">Client</p>
  "! Returns the <name> of the selected row
  METHODS name
    "! @parameter iv_row | the <row>
    IMPORTING iv_row TYPE i
    RETURNING VALUE(result) TYPE string.
ENDINTERFACE.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(2);
    expect(issues[0].getMessage()).to.contain("HTML tag <name> is not supported in ABAP Doc");
    expect(issues[0].getStart().getRow()).to.equal(3);
    expect(issues[0].getStart().getCol()).to.equal(18);
    expect(issues[0].getEnd().getCol()).to.equal(24);
    expect(issues[1].getMessage()).to.contain("<row>");
    expect(issues[1].getStart().getRow()).to.equal(5);
  });

});
