import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {CloudTypes} from "../../src/rules";
import {Issue} from "../../src/issue";
import {Config} from "../../src/config";
import {LanguageVersion, Release, ReleaseName} from "../../src/version";

async function findIssues(filename: string): Promise<Issue[]> {
  const config = Config.getDefault().get();
  config.syntax.version = {release: Release.Newest.name as ReleaseName, language: LanguageVersion.Cloud};
  const reg = new Registry(new Config(JSON.stringify(config))).addFile(new MemoryFile(filename, ""));
  await reg.parseAsync();
  const rule = new CloudTypes().initialize(reg);
  return rule.run(reg.getFirstObject()!);
}

describe("Rule: cloud_types", () => {

  it("SMBC, cloud enabled", async () => {
    const issues = await findIssues("zfoobar.smbc.json");
    expect(issues.length).to.equal(0);
  });

  it("TOBJ, cloud enabled", async () => {
    const issues = await findIssues("zfoobar.tobj.xml");
    expect(issues.length).to.equal(0);
  });

  it("G4BA, cloud enabled", async () => {
    const issues = await findIssues("zfoobar.g4ba.xml");
    expect(issues.length).to.equal(0);
  });

  it("PROG, not cloud enabled", async () => {
    const issues = await findIssues("zfoobar.prog.abap");
    expect(issues.length).to.equal(1);
  });

});
