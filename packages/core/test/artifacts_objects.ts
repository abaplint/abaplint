import {expect} from "chai";
import {ArtifactsObjects} from "../src/artifacts_objects";
import {Class} from "../src/objects";

describe("Top level artifacts", () => {

  it("CLAS", () => {
    const obj = ArtifactsObjects.newObject("ZCL_FOOBAR", "CLAS");
    expect(obj).to.be.instanceof(Class);
  });

  it("Throw error", () => {
    expect(() => { return ArtifactsObjects.newObject("ASDF", "ASDF"); }).to.throw("Unknown object type: ASDF");
  });

});