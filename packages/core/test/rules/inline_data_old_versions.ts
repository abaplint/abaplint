import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {InlineDataOldVersions} from "../../src/rules/inline_data_old_versions";
import {Version, LanguageVersion} from "../../src/version";
import {Config} from "../../src/config";
import {Issue} from "../../src/issue";

async function findIssues(abap: string, version?: Version, languageVersion?: LanguageVersion): Promise<readonly Issue[]> {
  const config = Config.getDefault(version);
  if (languageVersion) {
    const c = config.get();
    c.syntax.languageVersion = languageVersion;
    const newConfig = new Config(JSON.stringify(c));
    const reg = new Registry(newConfig).addFile(new MemoryFile("zfoo.prog.abap", abap));
    await reg.parseAsync();
    const rule = new InlineDataOldVersions();
    return rule.initialize(reg).run(reg.getFirstObject()!);
  }
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
    const issues = await findIssues("DATA(foo) = 2.", undefined, LanguageVersion.Cloud);
    expect(issues.length).to.equal(0);
  });

  it("open-abap", async () => {
    const issues = await findIssues("DATA(foo) = 2.", Version.OpenABAP);
    expect(issues.length).to.equal(0);
  });
});