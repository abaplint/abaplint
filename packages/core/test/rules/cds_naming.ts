import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {CDSNaming} from "../../src/rules";

async function findIssues(cds: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("foobar.ddls.asddls", cds));
  await reg.parseAsync();
  const rule = new CDSNaming();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: cds_naming", () => {

  it("error, non-Z name does not match prefix", async () => {
    const cds = `define view entity MY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("expected prefixes");
  });

  it("no issues, correct I_ prefix for view", async () => {
    const cds = `define view entity ZI_MY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct C_ prefix for view", async () => {
    const cds = `define view entity ZC_MY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct R_ prefix for view", async () => {
    const cds = `define view entity ZR_MY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct P_ prefix for view", async () => {
    const cds = `define view entity ZP_MY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct A_ prefix for view", async () => {
    const cds = `define view entity ZA_MY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct E_ prefix for view", async () => {
    const cds = `define view entity ZE_MY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct D_ prefix for abstract entity", async () => {
    const cds = `define abstract entity ZD_MY_ENTITY { key my_field : abap.char(10); }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct X_ prefix for view extend", async () => {
    const cds = `extend view entity ZX_MY_VIEW with { field1 }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, correct F_ prefix for table function", async () => {
    const cds = `define table function ZF_MY_FUNC returns { key my_field : abap.char(10); } implemented by method cl_my_class=>my_method`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("error, view missing valid prefix", async () => {
    const cds = `define view entity ZMY_VIEW as select from source { key id }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("expected prefixes");
  });

  it("error, abstract entity missing D_ prefix", async () => {
    const cds = `define abstract entity ZMY_ENTITY { key my_field : abap.char(10); }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("ZD_");
  });

  it("error, view extend missing X_ prefix", async () => {
    const cds = `extend view entity ZMY_VIEW with { field1 }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("ZX_");
  });

  it("error, table function missing F_ prefix", async () => {
    const cds = `define table function ZMY_FUNC returns { key my_field : abap.char(10); } implemented by method cl_my_class=>my_method`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("ZF_");
  });

  it("no issues, lowercase z prefix also works", async () => {
    const cds = `define abstract entity zd_my_entity { key my_field : abap.char(10); }`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

});
