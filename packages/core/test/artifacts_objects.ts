import {expect} from "chai";
import {ArtifactsObjects} from "../src/artifacts_objects";
import {Class} from "../src/objects";
import {UnknownObject} from "../src/objects/_unknown_object";

describe("Top level artifacts", () => {

  it("CLAS", () => {
    const obj = ArtifactsObjects.newObject("ZCL_FOOBAR", "CLAS");
    expect(obj).to.be.instanceof(Class);
  });

  it("Unknown object", () => {
    const obj = ArtifactsObjects.newObject("ASDF", "ASDF");
    expect(obj).to.be.instanceof(UnknownObject);
    expect(obj.getIssues().length).to.equal(1);
  });

  it("DTEL", () => {
    const obj = ArtifactsObjects.newObject("ZDATA", "DTEL");
    expect(obj.getIssues().length).to.equal(0);
  });

});