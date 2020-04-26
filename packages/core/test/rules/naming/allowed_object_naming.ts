import {expect} from "chai";
import {MemoryFile} from "../../../src/files/memory_file";
import {Registry} from "../../../src/registry";
import {AllowedObjectNaming} from "../../../src/rules";

function findIssues(filename: string) {
  const reg = new Registry().addFile(new MemoryFile(filename, "")).parse();
  const rule = new AllowedObjectNaming();
  return rule.run(reg.getObjects()[0]);
}

describe("Rule: allowed_object_naming", () => {

  it("DTEL, exceeds length", () => {
    const issues = findIssues("very_long_data_element_name_moo_foobar_boo.dtel.xml");
    expect(issues.length).to.equal(1);
  });

  it("DTEL, okay", () => {
    const issues = findIssues("name.dtel.xml");
    expect(issues.length).to.equal(0);
  });

  it("DTEL, bad characters", () => {
    const issues = findIssues("@foo£!.dtel.xml");
    expect(issues.length).to.equal(1);
  });

  it("DTEL, namespaced", () => {
    const issues = findIssues("#foobar#moo.dtel.xml");
    expect(issues.length).to.equal(0);
  });

  it("CLAS, namespaced", () => {
    const issues = findIssues("#foobar#cl_moo.clas.xml");
    expect(issues.length).to.equal(0);
  });

  it("SICF, with spaces", () => {
    const issues = findIssues("zzzzzx         34fdfa36f2a5b0c7d2a8cc037.sicf.xml");
    expect(issues.length).to.equal(0);
  });

  it("SMIM, ok", () => {
    const issues = findIssues("000c29f7ecfe1ed995a9bd75a2836628.smim.duesseldorf.geojson");
    expect(issues.length).to.equal(0);
  });

  it("SHI3, okay", () => {
    const issues = findIssues("22ecde72dc0b1ed99b99bb9fa4e48dd7.shi3.xml");
    expect(issues.length).to.equal(0);
  });

});
