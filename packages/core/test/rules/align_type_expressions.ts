import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AlignTypeExpressions} from "../../src/rules";
import {Issue} from "../../src/issue";
import {testRuleFixSingle} from "./_utils";

function testFix(input: string, expected: string, noIssuesAfter = true) {
  testRuleFixSingle(input, expected, new AlignTypeExpressions(), undefined, undefined, noIssuesAfter);
}

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new AlignTypeExpressions();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: align_type_expressions", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("Align TYPEs, insert spaces", async () => {
    const input = `
TYPES: BEGIN OF foo,
         bar TYPE i,
         foobar TYPE i,
       END OF foo.`;

    const expected = `
TYPES: BEGIN OF foo,
         bar    TYPE i,
         foobar TYPE i,
       END OF foo.`;
    testFix(input, expected);
  });

  it("Align TYPEs, ok", async () => {
    const issues = await findIssues(`
TYPES: BEGIN OF foo,
         bar    TYPE i,
         foobar TYPE i,
       END OF foo.`);
    expect(issues.length).to.equal(0);
  });

  it("Align METHODS types", async () => {
    const issues = await findIssues(`
INTERFACE lif.
  METHODS bar
    IMPORTING
      foo TYPE i
      foobar TYPE i.
ENDINTERFACE.`);
    expect(issues.length).to.equal(1);
  });

  it("Align METHODS types, ok", async () => {
    const issues = await findIssues(`
INTERFACE lif.
  METHODS bar
    IMPORTING
      foo    TYPE i
      foobar TYPE i.
ENDINTERFACE.`);
    expect(issues.length).to.equal(0);
  });

  it("Align METHODS types, returning", async () => {
    const issues = await findIssues(`
INTERFACE lif.
  METHODS bar
    IMPORTING
      foo TYPE i
    RETURNING
      VALUE(sdf) TYPE f.
ENDINTERFACE.`);
    expect(issues.length).to.equal(1);
  });

  it("Align METHODS types, ok", async () => {
    const issues = await findIssues(`
INTERFACE lif.
  METHODS bar
    IMPORTING
      foo        TYPE i
    RETURNING
      VALUE(sdf) TYPE f.
ENDINTERFACE.`);
    expect(issues.length).to.equal(0);
  });

  it("Types, length, ok", async () => {
    const issues = await findIssues(`
    TYPES:
      BEGIN OF ty_color_line,
        exception(1) TYPE c,
        color        TYPE lvc_t_scol,
      BEGIN OF ty_color_line.`);
    expect(issues.length).to.equal(0);
  });

  it("Types, with INCLUDE, skip", async () => {
    const issues = await findIssues(`
  TYPES:
    BEGIN OF ty_packing_top.
      INCLUDE TYPE ty_packing_fields.
  TYPES: content TYPE STANDARD TABLE OF ty_content WITH EMPTY KEY,
      packing TYPE STANDARD TABLE OF ty_packing_sub WITH EMPTY KEY,
    END OF ty_packing_top .`);
    expect(issues.length).to.equal(0);
  });

  it("Align TYPEs, remove spaces", async () => {
    const input = `
TYPES: BEGIN OF foo,
         bar    TYPE i,
         foobar    TYPE i,
       END OF foo.`;

    const expected = `
TYPES: BEGIN OF foo,
         bar    TYPE i,
         foobar TYPE i,
       END OF foo.`;
    testFix(input, expected);
  });

});
