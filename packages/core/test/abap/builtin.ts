import {expect} from "chai";
import {BuiltIn} from "../../src";

describe("builtin", () => {
  it("to upper, default parameter", async () => {
    const method = new BuiltIn().searchBuiltin("TO_UPPER");
    expect(method).to.not.equals(undefined);
    expect(method!.getParameters().getDefaultImporting()).to.equal("VAL");
  });
});