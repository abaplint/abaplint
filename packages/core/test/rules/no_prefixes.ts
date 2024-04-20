import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {NoPrefixes} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(code: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("foobar.prog.abap", code));
  await reg.parseAsync();
  const rule = new NoPrefixes();
  return rule.run(reg.getFirstObject()!);
}

describe("Rule: no_prefixes", () => {

  it("syntax error, no issues", async () => {
    const abap = `syntax error`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("DATA, error", async () => {
    const abap = `DATA lv_foo TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("DATA, error, fixed", async () => {
    const abap = `DATA foo TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("DATA, error, inline", async () => {
    const abap = `DATA(lv_foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("DATA, error, inline, fixed", async () => {
    const abap = `DATA(foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("FINAL, error, inline", async () => {
    const abap = `FINAL(lv_foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("FINAL, error, inline, fixed", async () => {
    const abap = `FINAL(foo) = 2.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("FIELD-SYMBOLS, error", async () => {
    const abap = `FIELD-SYMBOLS <lv_foo> TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("FIELD-SYMBOLS, fixed", async () => {
    const abap = `FIELD-SYMBOLS <foo> TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("TYPES", async () => {
    const abap = `TYPES ty_foo TYPE i.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("method parameter, error expected", async () => {
    const abap = `CLASS logic DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING iv_bar TYPE i.
ENDCLASS.
CLASS logic IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("method parameter, fixed", async () => {
    const abap = `CLASS logic DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING bar TYPE i.
ENDCLASS.
CLASS logic IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("is prefix with bool, class", async () => {
    const abap = `CLASS foo DEFINITION.
  PUBLIC SECTION.
    METHODS bar
      CHANGING
        is_error TYPE abap_bool.
ENDCLASS.

CLASS foo IMPLEMENTATION.
  METHOD bar.
  ENDMETHOD.
ENDCLASS.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("is prefix with bool, interface", async () => {
    const abap = `INTERFACE lif.
  METHODS bar
    CHANGING
      is_error TYPE abap_bool.
ENDINTERFACE.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});
