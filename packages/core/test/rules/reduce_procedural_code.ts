import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {ReduceProceduralCode} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new ReduceProceduralCode();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: reduce_procedural_code", () => {

  it("parser error, no issues expected", async () => {
    const issues = await findIssues("hello world.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const abap = `FORM foo.
  DATA lv_bar TYPE i.
  lv_bar = 2 + 2.
  IF lv_bar = 4.
    WRITE 'hello world'.
  ENDIF.
  DATA lv_bar TYPE i.
  lv_bar = 2 + 2.
  IF lv_bar = 4.
    WRITE 'hello world'.
  ENDIF.
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("ok, function module", async () => {
    const abap = `FUNCTION sdfsd.
  DATA lv_bar TYPE i.
ENDFUNCTION.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("ok", async () => {
    const abap = `FORM foo.
  NEW zcl_global_class( )->run_logic( ).
ENDFORM.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

});
