import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {PreferInline} from "../../src/rules";
import {Issue} from "../../src/issue";
import {testRuleFixSingle} from "./_utils";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zprefer_inline.prog.abap", abap));
  await reg.parseAsync();
  const rule = new PreferInline();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

function testFix(input: string, expected: string) {
  testRuleFixSingle(input, expected, new PreferInline());
}

describe("Rule: prefer_inline", () => {

  it("parser error", async () => {
    const issues = await findIssues("parser error");
    expect(issues.length).to.equal(0);
  });

  it("Simple data, no code", async () => {
    const issues = await findIssues("DATA foo TYPE i.");
    expect(issues.length).to.equal(0);
  });

  it("Simple, data in FORM", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA moo TYPE i.
  moo = 2.
ENDFORM.`);
    expect(issues.length).to.equal(1);
  });

  it("Already inline", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA(moo) = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Dont inline MOVE-CORRESPONDING", async () => {
    const issues = await findIssues(`
FORM foo.
  TYPES: BEGIN OF ty_stru,
           bar TYPE i,
         END OF ty_stru.
  DATA tree TYPE ty_stru.
  DATA structure LIKE tree.
  MOVE-CORRESPONDING structure TO tree.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Defined outside FORM", async () => {
    const issues = await findIssues(`
DATA moo TYPE i.
FORM foo.
  moo = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Fist use is WRITE statement", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA moo TYPE i.
  WRITE moo.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("No inlining for generic types", async () => {
    const issues = await findIssues(`
FORM foo.
  FIELD-SYMBOLS <foo> TYPE any.
  ASSIGN 2 TO <foo>.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("No inlining for void types", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA sdf TYPE sdfsdfsdfsd.
  sdf = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("First write should be full/pure", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA sdf TYPE sy.
  sdf-tabix = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("testfix, Simple, data in FORM", async () => {
    const input = `
FORM foo.
  DATA moo TYPE i.
  moo = 2.
ENDFORM.`;
    const expected = `
FORM foo.
` + "  " + `
  DATA(moo) = 2.
ENDFORM.`;
    testFix(input, expected);
  });

  it("testfix, first use is move", async () => {
    const input = `
FORM bar.
  DATA lt_lengths TYPE STANDARD TABLE OF string.
  DATA lt_dists TYPE STANDARD TABLE OF string.
  lt_dists = lt_lengths.
  DELETE lt_dists TO 2.
ENDFORM.`;
    const expected = `
FORM bar.
  DATA lt_lengths TYPE STANDARD TABLE OF string.
` + `  ` + `
  DATA(lt_dists) = lt_lengths.
  DELETE lt_dists TO 2.
ENDFORM.`;
    testFix(input, expected);
  });

  it("testfix, field symbol", async () => {
    const input = `
FORM sdf.
  DATA tab TYPE STANDARD TABLE OF i.
  FIELD-SYMBOLS: <bar> TYPE i.
  LOOP AT tab ASSIGNING <bar>.
  ENDLOOP.
ENDFORM.`;
    const expected = `
FORM sdf.
  DATA tab TYPE STANDARD TABLE OF i.
` + `  ` + `
  LOOP AT tab ASSIGNING FIELD-SYMBOL(<bar>).
  ENDLOOP.
ENDFORM.`;
    testFix(input, expected);
  });

  it("First write is CLEAR, not inlineable", async () => {
    const issues = await findIssues(`
FORM foo.
  DATA sdf TYPE i.
  CLEAR sdf.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Dont suggest to inline FORM parameters", async () => {
    const issues = await findIssues(`
FORM foobar CHANGING bar TYPE i.
  bar = 2.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("use in macro, not inlineable", async () => {
    const issues = await findIssues(`
FORM local.
  DATA foo TYPE i.
  DEFINE _macro.
    foo = 2.
  END-OF-DEFINITION.
  _macro.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("data defined in macro, not inlineable", async () => {
    const issues = await findIssues(`
FORM local.
  DEFINE _macro.
    DATA foo TYPE i.
    foo = 2.
  END-OF-DEFINITION.
  _macro.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("skip if data is casted", async () => {
    const issues = await findIssues(`
  CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.

  FORM bar.
    DATA io_repo TYPE REF TO lcl_bar.
    DATA lo_repo_online TYPE REF TO lcl_bar.
    lo_repo_online ?= io_repo.
  ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("skip if there is a read in the same statement", async () => {
    const issues = await findIssues(`
FORM bar.
  DATA lv_prev TYPE i.
  DATA lv_count TYPE i.
  lv_prev = lv_prev + lv_count.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("skip if BEGIN OF", async () => {
    const issues = await findIssues(`
FORM bar.
  DATA BEGIN OF ls_udmo_long_text.
  DATA language TYPE dm40t-sprache.
  DATA header   TYPE thead.
  DATA content TYPE xstring.
  DATA END OF ls_udmo_long_text.
  ls_udmo_long_text = 'A'.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Dont inline ls_files, there is a type reference", async () => {
    const issues = await findIssues(`
  FORM bar.
    DATA: ls_files TYPE string,
          ls_like LIKE ls_files.
    ls_files = 'abc'.
  ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it("Dont inline, type infered", async () => {
    const issues = await findIssues(`
  CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.

  FORM bar.
    DATA lo_x TYPE REF TO lcl_bar.
    lo_x = NEW #( ).
  ENDFORM.`);
    expect(issues[0]?.getMessage()).to.equal(undefined);
  });

////////////////////

  it.skip("Dont inline, type P, this will change the type?", async () => {
    const issues = await findIssues(`
FORM asdf.
  DATA lv_moo TYPE p DECIMALS 3.
  lv_moo = 2.
  WRITE: / lv_moo.
ENDFORM.`);
    expect(issues.length).to.equal(0);
  });

  it.skip("Types should not change when inlining", async () => {
    const issues = await findIssues(`
DATA foo TYPE c.
foo = |abc|.`);
    expect(issues.length).to.equal(0);
  });

});
