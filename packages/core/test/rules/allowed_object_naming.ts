import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AllowedObjectNaming} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(filename: string): Promise<Issue[]> {
  const reg = new Registry().addFile(new MemoryFile(filename, ""));
  await reg.parseAsync();
  const rule = new AllowedObjectNaming();
  return rule.run(reg.getFirstObject()!);
}

describe("Rule: allowed_object_naming", () => {

  it("DTEL, exceeds length", async () => {
    const issues = await findIssues("very_long_data_element_name_moo_foobar_boo.dtel.xml");
    expect(issues.length).to.equal(1);
  });

  it("DTEL, okay", async () => {
    const issues = await findIssues("name.dtel.xml");
    expect(issues.length).to.equal(0);
  });

  it("VIEW, okay", async () => {
    const issues = await findIssues("name.view.xml");
    expect(issues.length).to.equal(0);
  });

  it("DTEL, bad characters", async () => {
    const issues = await findIssues("@foo£!.dtel.xml");
    expect(issues.length).to.equal(1);
  });

  it("DTEL, namespaced", async () => {
    const issues = await findIssues("#foobar#moo.dtel.xml");
    expect(issues.length).to.equal(0);
  });

  it("CLAS, namespaced", async () => {
    const issues = await findIssues("#foobar#cl_moo.clas.xml");
    expect(issues.length).to.equal(0);
  });

  it("SICF, with spaces", async () => {
    const issues = await findIssues("zzzzzx         34fdfa36f2a5b0c7d2a8cc037.sicf.xml");
    expect(issues.length).to.equal(0);
  });

  it("SMIM, ok", async () => {
    const issues = await findIssues("000c29f7ecfe1ed995a9bd75a2836628.smim.duesseldorf.geojson");
    expect(issues.length).to.equal(0);
  });

  it("SHI3, okay", async () => {
    const issues = await findIssues("22ecde72dc0b1ed99b99bb9fa4e48dd7.shi3.xml");
    expect(issues.length).to.equal(0);
  });

  it("NROB, okay", async () => {
    const issues = await findIssues("#abc#defg.nrob.xml");
    expect(issues.length).to.equal(0);
  });

  it("SUSO, okay", async () => {
    const issues = await findIssues("#abc#defg.suso.xml");
    expect(issues.length).to.equal(0);
  });

  it("MSAG, okay", async () => {
    const issues = await findIssues("%3e6.msag.xml");
    expect(issues.length).to.equal(0);
  });

  it("NSPC, okay", async () => {
    const issues = await findIssues("#foobar#.nspc.xml");
    expect(issues.length).to.equal(0);
  });

});
