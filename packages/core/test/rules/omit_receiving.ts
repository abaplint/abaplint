import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {OmitReceiving} from "../../src/rules/omit_receiving";

async function findIssues(abap: string, filename: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, abap));
  await reg.parseAsync();
  const rule = new OmitReceiving();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: omit_receiving", () => {
  it("parser error", async () => {
    const abap = "parser error";
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

  it("simple", async () => {
    const abap = `
    upload_pack(
      EXPORTING
        io_client       = lo_client
        iv_url          = iv_url
        iv_deepen_level = iv_deepen_level
        it_hashes       = lt_hashes
      RECEIVING
        rt_objects      = et_objects ).`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(1);
  });

  it("fixed", async () => {
    const abap = `
    bar = upload_pack(
      io_client       = lo_client
      iv_url          = iv_url
      iv_deepen_level = iv_deepen_level
      it_hashes       = lt_hashes ).`;
    const issues = await findIssues(abap, "zreport.prog.abap");
    expect(issues.length).to.equal(0);
  });

});