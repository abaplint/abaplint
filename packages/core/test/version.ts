import {expect} from "chai";
import {Version} from "../src";
import {getPreviousVersion} from "../src/version";

describe("getPreviousVersion", () => {

  it("getPreviousVersion", () => {
    expect(getPreviousVersion(Version.v751)).to.equal(Version.v750);
  });

});
