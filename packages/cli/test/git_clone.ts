import {expect} from "chai";
import {buildGitCloneArguments} from "../src/git_clone";

describe("git clone", () => {
  it("keeps the URL and branch as separate arguments", () => {
    const url = "https://example.com/repository.git;echo injected";
    const branch = "main;echo injected";

    expect(buildGitCloneArguments(url, branch)).to.deep.equal([
      "clone",
      "--quiet",
      "--depth",
      "1",
      "-b",
      branch,
      "--",
      url,
      ".",
    ]);
  });

  it("protects a URL that starts with a dash from option injection", () => {
    const url = "--upload-pack=echo injected";

    expect(buildGitCloneArguments(url)).to.deep.equal([
      "clone",
      "--quiet",
      "--depth",
      "1",
      "--",
      url,
      ".",
    ]);
  });
});
