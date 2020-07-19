import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {InlineDataOldVersions} from "../../src/rules/inline_data_old_versions";
import {Version} from "../../src/version";
import {Config} from "../../src/config";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, version?: Version): Promise<readonly Issue[]> {
  const config = Config.getDefault(version);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new InlineDataOldVersions();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: inline data on old versions", () => {
  it("no issues", async () => {
    const issues = await findIssues("DATA(foo) = 2.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues("DATA(foo) = 2.", Version.v702);
    expect(issues.length).to.equal(1);
  });

  it("cloud", async () => {
    const issues = await findIssues("DATA(foo) = 2.", Version.Cloud);
    expect(issues.length).to.equal(0);
  });
});