import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {Issue} from "../../src/issue";
import {CDSFieldOrder} from "../../src/rules";

async function findIssues(cds: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("foobar.ddls.asddls", cds));
  await reg.parseAsync();
  const rule = new CDSFieldOrder();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: cds_field_order", () => {

  it("no issues, correct order", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to target as _Assoc on _Assoc.id = source.id
{
  key id,
  field1,
  _Assoc
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, only key fields", async () => {
    const cds = `define view entity test as select from source {
  key id,
  key name
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, no key fields no associations", async () => {
    const cds = `define view entity test as select from source {
  field1,
  field2
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("error, key field after non-key field", async () => {
    const cds = `define view entity test as select from source {
  field1,
  key id
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Key fields");
  });

  it("error, association not last", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to target as _Assoc on _Assoc.id = source.id
{
  key id,
  _Assoc,
  field1
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("Associations");
  });

  it("error, both key and association wrong", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to target as _Assoc on _Assoc.id = source.id
{
  field1,
  _Assoc,
  key id,
  field2
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(3);
  });

  it("no issues, multiple associations at end", async () => {
    const cds = `define view entity test as select from source
  association [1..1] to target1 as _Assoc1 on _Assoc1.id = source.id
  association [0..*] to target2 as _Assoc2 on _Assoc2.id = source.id
{
  key id,
  field1,
  _Assoc1,
  _Assoc2
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

  it("no issues, single key field only", async () => {
    const cds = `define view entity test as select from source {
  key id
}`;
    const issues = await findIssues(cds);
    expect(issues.length).to.equal(0);
  });

});
