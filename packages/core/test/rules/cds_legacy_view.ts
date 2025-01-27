import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {CDSLegacyView} from "../../src/rules/cds_legacy_view";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("foobar.ddls.asddls", abap));
  await reg.parseAsync();
  const rule = new CDSLegacyView();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: cds_legacy_view", () => {

  it("legacy", async () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
  });

  it("entity, ok", async () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view entity zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("table function, ok", async () => {
    const cds = `@EndUserText.label: 'Foobar'
define table function ymoofunc with parameters p_anp : zanp, p_prevanp : zprevanp
returns {
  mandt : abap.clnt;
  foods : zmmooo;
  moods : abap.char( 50 );
}
implemented by method zcl_bar=>dsffdsfd;`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("error", async () => {
    const cds = `parser error`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

});