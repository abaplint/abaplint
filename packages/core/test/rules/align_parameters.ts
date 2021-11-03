import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AlignParameters} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new AlignParameters();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: align_parameters", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("call function, issue", async () => {
    const abap = `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo = 2
    parameter = 3.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("call function, multi parameters on single line, issue", async () => {
    const abap = `CALL FUNCTION 'FOOBAR' EXPORTING foo = 2 parameter = 3.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("call function, fixed", async () => {
    const abap = `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo       = 2
    parameter = 3.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("call function, aligned, but wrong column", async () => {
    const abap = `CALL FUNCTION 'FOOBAR'
  EXPORTING
    foo         = 2
    parameter   = 3.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("call function, no parameters", async () => {
    const abap = `CALL FUNCTION 'FOOBAR'.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("method, no parameters", async () => {
    const abap = `foobar( ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("method, single source parameter", async () => {
    const abap = `foobar( 1 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("method, single named source parameter", async () => {
    const abap = `foobar( moo = 1 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("method, unaligned, expect issue", async () => {
    const abap = `foobar( moo = 1
      bar = 1 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("method, fixed", async () => {
    const abap = `foobar( moo = 1
                          bar = 1 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("method, unaligned EXPORTING, expect issue", async () => {
    const abap = `foobar( EXPORTING moo = 1
      bar = 1 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("method, EXPORTING, fixed", async () => {
    const abap = `foobar(
      EXPORTING moo = 1
                bar = 1 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("method, unaligned IMPORTING, expect issue", async () => {
    const abap = `foobar( IMPORTING moo = var1
      bar = var2 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("method, IMPORTING, fixed", async () => {
    const abap = `foobar(
      IMPORTING moo = var1
                bar = var2 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("method, EXCEPTIONS", async () => {
    const abap = `foobar( EXCEPTIONS moo = 1
      bar = 2 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("method, EXCEPTIONS, fixed", async () => {
    const abap = `foobar(
      EXCEPTIONS
        moo = 1
        bar = 2 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it.skip("CALL METHOD, unaligned, expect issue", async () => {
    const abap = `CALL METHOD foo EXPORTING moo = 1
      bar = 1.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("CALL METHOD, fixed", async () => {
    const abap = `CALL METHOD foo EXPORTING
      moo = 1
      bar = 1.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});
