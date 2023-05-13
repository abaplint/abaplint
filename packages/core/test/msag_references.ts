import {expect} from "chai";
import {IMSAGReferences} from "../src/_imsag_references";
import {MSAGReferences} from "../src/msag_references";

function get(): IMSAGReferences {
  return new MSAGReferences();
}

describe("MSAG References", () => {

  it("empty", async () => {
    const ref = get();
    expect(ref.listByFilename("foo").length).to.equal(0);
    expect(ref.listByMessage("foo", 1).length).to.equal(0);
  });

});
