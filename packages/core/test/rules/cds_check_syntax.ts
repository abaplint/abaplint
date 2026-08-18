import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {DataDefinition} from "../../src/objects";
import {Registry} from "../../src/registry";
import {CDSCheckSyntax} from "../../src/rules";

const source = `define view entity ZSOURCE as select from mara
{
  ExistingField
}`;

async function findIssues(cds: string, withSource = false): Promise<readonly Issue[]> {
  const files = [new MemoryFile("ztarget.ddls.asddls", cds)];
  if (withSource) {
    files.push(new MemoryFile("zsource.ddls.asddls", source));
  }

  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  const target = Array.from(reg.getObjectsByType("DDLS"))
    .find(o => o.getFiles().some(f => f.getFilename() === "ztarget.ddls.asddls")) as DataDefinition;
  return new CDSCheckSyntax().initialize(reg).run(target);
}

describe("Rule: cds_check_syntax", () => {
  it("accepts a qualified field which exists", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZSOURCE
{
  ZSOURCE.ExistingField
}`, true);
    expect(issues.length).to.equal(0);
  });

  it("reports a qualified field which does not exist", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZSOURCE
{
  ZSOURCE.MissingField
}`, true);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS field "MissingField" not found in "ZSOURCE"');
    expect(issues[0].getStart().getRow()).to.equal(3);
  });

  it("reports an unqualified field which does not exist", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZSOURCE
{
  MissingField
}`, true);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS field "MissingField" not found in "ZSOURCE"');
  });

  it("reports a missing local source", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZMISSING
{
  AnyField
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS source "ZMISSING" not found');
  });

  it("reports a missing local association target", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from mara
  association [0..1] to ZMISSING as _Missing on 1 = 1
{
  matnr
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS source "ZMISSING" not found');
  });

  it("reports a missing local type", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  Field : ZMISSING;
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS type "ZMISSING" not found');
  });

  it("accepts ABAP built-in and unresolved standard types", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  CharacterField : abap.char(10);
  QuantityField  : menge_d;
}`);
    expect(issues.length).to.equal(0);
  });

  it("accepts an unresolved source outside the error namespace", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from I_STANDARD_SOURCE
{
  AnyField
}`);
    expect(issues.length).to.equal(0);
  });
});
