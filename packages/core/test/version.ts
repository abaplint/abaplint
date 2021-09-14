import {expect} from "chai";
import {Version} from "../src";
import {getPreviousVersion} from "../src/version";

describe("getPreviousVersion", () => {

  it("751", () => {
    expect(getPreviousVersion(Version.v751)).to.equal(Version.v750);
  });

  it("cloud", () => {
    expect(getPreviousVersion(Version.Cloud)).to.equal(Version.v756);
  });

  it("open-abap", () => {
    expect(getPreviousVersion(Version.OpenABAP)).to.equal(Version.v702);
  });

});
