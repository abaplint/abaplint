import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {AFFAndXML} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(files: {filename: string, contents: string}[]): Promise<Issue[]> {
  const reg = new Registry().addFiles(files.map(f => new MemoryFile(f.filename, f.contents)));
  await reg.parseAsync();
  const rule = new AFFAndXML();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: aff_and_xml", () => {

  it("no issues, only xml", async () => {
    const issues = await findIssues([
      {filename: "ztest.clas.xml", contents: "<xml></xml>"},
    ]);
    expect(issues.length).to.equal(0);
  });

  it("no issues, only json", async () => {
    const issues = await findIssues([
      {filename: "ztest.clas.json", contents: "{}"},
    ]);
    expect(issues.length).to.equal(0);
  });

  it("error when both xml and json", async () => {
    const issues = await findIssues([
      {filename: "ztest.clas.xml", contents: "<xml></xml>"},
      {filename: "ztest.clas.json", contents: "{}"},
    ]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("AFF JSON and XML");
  });

  it("no issues, only abap and xml", async () => {
    const issues = await findIssues([
      {filename: "ztest.clas.xml", contents: "<xml></xml>"},
      {filename: "ztest.clas.abap", contents: "WRITE 'hello'."},
    ]);
    expect(issues.length).to.equal(0);
  });

});
