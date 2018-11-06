import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Class} from "../../src/objects";

describe("Objects, class", () => {

  it("isException, false", () => {
    const reg = new Registry().addFile(new MemoryFile("cl_foo.clas.abap", "foo bar"));
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.isException()).to.equal(false);
  });

  it("isException, true", () => {
    const reg = new Registry().addFile(new MemoryFile("zcx_foo.clas.abap", "foo bar"));
    const clas = reg.getABAPObjects()[0] as Class;
    expect(clas.isException()).to.equal(true);
  });

});