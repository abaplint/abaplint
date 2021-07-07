import {expect} from "chai";
import {IDDICReferences} from "../src/_iddic_references";
import {DDICReferences} from "../src/ddic_references";
import {Domain} from "../src/objects";

function get(): IDDICReferences {
  return new DDICReferences();
}

describe("DDIC References", () => {

  it("empty", async () => {
    const ref = get();
    const obj = new Domain("DOMA1");
    expect(ref.listUsing(obj)).length.to.equal(0);
    expect(ref.listUsedBy(obj)).length.to.equal(0);
  });

});
