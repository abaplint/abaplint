import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {InlineDataOldVersions} from "../../src/rules/syntax/inline_data_old_versions";
import {Version} from "../../src/version";
import {Config} from "../../src/config";

function findIssues(abap: string, version?: Version) {
  const config = Config.getDefault(version);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  const rule = new InlineDataOldVersions();
  return rule.run(reg.getObjects()[0], reg);
}

describe("Rule: inline data on old versions", function() {
  it("no issues", function () {
    expect(findIssues("DATA(foo) = 2.").length).to.equal(0);
  });

  it("issue", function () {
    expect(findIssues("DATA(foo) = 2.", Version.v702).length).to.equal(1);
  });
});