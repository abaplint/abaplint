import {expect} from "chai";
import {Artifacts} from "../src/artifacts";
import {Class} from "../src/objects";

describe("Top level artifacts", () => {

  it("CLAS", () => {
    const obj = Artifacts.newObject("ZCL_FOOBAR", "CLAS");
    expect(obj).to.be.instanceof(Class);
  });

  it("Throw error", () => {
    expect(() => { return Artifacts.newObject("ASDF", "ASDF"); }).to.throw("Unknown object type: ASDF");
  });

});