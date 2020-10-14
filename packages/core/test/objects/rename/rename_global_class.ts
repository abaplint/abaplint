import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename Global Class", () => {

  it("CLAS, simple example, just one abap file", () => {
    const abap = `CLASS zcl_foo DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS ZCL_FOO IMPLEMENTATION.
ENDCLASS.`;
    const reg = new Registry().addFile(new MemoryFile("zcl_foo.clas.abap", abap)).parse();

    new Renamer(reg).rename("CLAS", "zcl_foo", "cl_foo");

    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "cl_foo.clas.abap") {
        const expected = `CLASS CL_FOO DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS CL_FOO IMPLEMENTATION.
ENDCLASS.`;
        expect(f.getRaw()).to.equal(expected);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

});