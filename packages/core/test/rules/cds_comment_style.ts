import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {CDSCommentStyle} from "../../src/rules";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("foobar.ddls.asddls", abap));
  await reg.parseAsync();
  const rule = new CDSCommentStyle();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: cds_comment_style", () => {

  it("no comments", async () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("comment, error", async () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf -- hello world error
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
  });

  it("comment, fixed", async () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf // hello world fixed
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

});