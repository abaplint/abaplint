import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {CatchAndRaise} from "../../src/rules/catch_and_raise";

async function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new CatchAndRaise();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: catch_and_raise", () => {
  it("no issues, unrelated code", async () => {
    const issues = await findIssues("WRITE 'hello'.");
    expect(issues.length).to.equal(0);
  });

  it("no issues, catch with handling", async () => {
    const abap = `
    TRY.
      something( ).
    CATCH zcx_something INTO DATA(lv_exc).
      lv_handled = abap_true.
      RAISE EXCEPTION lv_exc.
    ENDTRY.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("no issues, catch without re-raise", async () => {
    const abap = `
    TRY.
      something( ).
    CATCH zcx_something.
      RETURN.
    ENDTRY.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("no issues, raise different variable", async () => {
    const abap = `
    TRY.
      something( ).
    CATCH zcx_something INTO DATA(lv_exc).
      RAISE EXCEPTION lv_other.
    ENDTRY.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("no issues, raise exception type", async () => {
    const abap = `
    TRY.
      something( ).
    CATCH zcx_something INTO DATA(lv_exc).
      RAISE EXCEPTION TYPE zcx_something.
    ENDTRY.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue, inline data", async () => {
    const abap = `
    TRY.
      something( ).
    CATCH zcx_something INTO DATA(lv_exc).
      RAISE EXCEPTION lv_exc.
    ENDTRY.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("issue, two inline data", async () => {
    const abap = `
    TRY.
      something( ).
    CATCH zcx_bar INTO DATA(lv_ex).
      RAISE EXCEPTION lv_ex.
    CATCH zcx_something INTO DATA(lv_exc).
      RAISE EXCEPTION lv_exc.
    ENDTRY.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(2);
  });

  it("issue, existing variable", async () => {
    const abap = `
    DATA lv_exc TYPE REF TO zcx_something.
    TRY.
      something( ).
    CATCH zcx_something INTO lv_exc.
      RAISE EXCEPTION lv_exc.
    ENDTRY.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("no issues, parser error", async () => {
    const issues = await findIssues("kjlsfklsdfj sdf");
    expect(issues.length).to.equal(0);
  });
});
