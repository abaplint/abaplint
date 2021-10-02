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
    expect(ref.listUsing(obj).length).to.equal(0);
    expect(ref.listWhereUsed(obj).length).to.equal(0);
  });

  it("basic set", async () => {
    const ref = get();
    const obj1 = new Domain("DOMA1");
    const obj2 = new Domain("DOMA2");
    ref.setUsing(obj1, [{object: obj2}]);
    expect(ref.listUsing(obj1).length).to.equal(1);
    expect(ref.listWhereUsed(obj2).length).to.equal(1);
  });

});
