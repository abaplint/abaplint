import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {CDSAssociationName} from "../../src/rules";

async function findIssues(cds: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("foobar.ddls.asddls", cds));
  await reg.parseAsync();
  const rule = new CDSAssociationName();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: cds_association_name", () => {

  it("no associations, no issues", async () => {
    const cds = `define view entity test as select from source {
  key id
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("association with underscore, no issue", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to target as _Assoc on _Assoc.id = source.id
{
  key id
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("association without underscore, error", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to target as Assoc on Assoc.id = source.id
{
  key id
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Assoc");
  });

  it("multiple associations, mixed", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to target1 as _Good on _Good.id = source.id
  association [0..*] to target2 as Bad on Bad.id = source.id
{
  key id
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Bad");
  });

  it("association without alias, no issue", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to _target on _target.id = source.id
{
  key id
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

});
