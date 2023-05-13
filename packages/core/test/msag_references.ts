import {expect} from "chai";
import {IMSAGReferences} from "../src/_imsag_references";
import {MSAGReferences} from "../src/msag_references";
import {Position} from "../src";
import {Identifier} from "../src/abap/1_lexer/tokens";

function get(): IMSAGReferences {
  return new MSAGReferences();
}

describe("MSAG References", () => {

  it("empty", async () => {
    const ref = get();
    expect(ref.listByFilename("foo").length).to.equal(0);
    expect(ref.listByMessage("foo", "001").length).to.equal(0);
  });

  it("basic", async () => {
    const ref = get();
    const token = new Identifier(new Position(2, 2), "sdf");
    const filename = "foo.txt";
    ref.addUsing(filename, token, "ZFOO", "001");
    expect(ref.listByFilename(filename).length).to.equal(1);
    expect(ref.listByMessage("ZFOO", "001").length).to.equal(1);
  });

});
