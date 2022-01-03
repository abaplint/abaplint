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

  it("CALL METHOD, unaligned, expect issue", async () => {
    const abap = `CALL METHOD foo EXPORTING moo = 1
      bar = 1.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("CALL METHOD, fixed", async () => {
    const abap = `CALL METHOD foo EXPORTING
      moo = 1
      bar = 1.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("VALUE, problem", async () => {
    const abap = `foo = VALUE #(
      foo = bar
          moo = 2 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("VALUE, fixed", async () => {
    const abap = `foo = VALUE #(
      foo = bar
      moo = 2 ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("RAISE EXCEPTION 1, ok", async () => {
    const abap = `RAISE EXCEPTION lx_root.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("RAISE EXCEPTION 2, ok", async () => {
    const abap = `RAISE RESUMABLE EXCEPTION TYPE zcx_foobar.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("RAISE EXCEPTION 2, ok", async () => {
    const abap = `RAISE EXCEPTION TYPE lcx_exception EXPORTING iv_text = lv_text.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("RAISE EXCEPTION, error", async () => {
    const abap = `RAISE EXCEPTION TYPE lcx_exception EXPORTING
    iv_text = lv_text
      foo = bar.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("RAISE EXCEPTION, fixed", async () => {
    const abap = `RAISE EXCEPTION TYPE lcx_exception EXPORTING
      iv_text = lv_text
      foo     = bar.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("CREATE OBJECT, error", async () => {
    const abap = `CREATE OBJECT ei_page TYPE lcl_gui_page_commit
      EXPORTING io_repo  = mo_repo
      io_stage = mo_stage.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("CREATE OBJECT, fixed", async () => {
    const abap = `CREATE OBJECT ei_page TYPE lcl_gui_page_commit
      EXPORTING io_repo  = mo_repo
                io_stage = mo_stage.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("RAISE EVENT, error", async () => {
    const abap = `RAISE EVENT message EXPORTING
    p_kind    = c_error
        p_test    = c_my_name.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("RAISE EVENT, fixed", async () => {
    const abap = `RAISE EVENT message EXPORTING
        p_kind = c_error
        p_test = c_my_name.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("NEW, error", async () => {
    const abap = `foo = NEW #(
    p_kind    = c_error
        p_test    = c_my_name ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("NEW, fixed", async () => {
    const abap = `foo = NEW #(
          p_kind = c_error
          p_test = c_my_name ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("CREATE OBJECT, with exceptions, ok", async () => {
    const abap = `CREATE OBJECT go_test
  EXPORTING
    i_parent          = abap_false
    i_appl_events     = abap_true
  EXCEPTIONS
    error_cntl_create = 1
    error_cntl_init   = 2
    error_cntl_link   = 3
    error_dp_create   = 4
    OTHERS            = 5.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});
