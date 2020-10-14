import {MemoryFile} from "../../../src/files/memory_file";
import {Registry} from "../../../src/registry";

describe("Rename Global Class", () => {

  it("CLAS, 1", () => {
    const abap = `sdfsd`;
    const reg = new Registry().addFile(new MemoryFile("cl_foo.clas.abap", abap)).parse();


  });

});