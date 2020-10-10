import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Highlight} from "../../src/lsp/highlight";
import {MemoryFile} from "../../src/files/memory_file";

const filename: string = "foobar.prog.abap";

describe("LSP, highlight", () => {

  it("parser error", () => {
    const file = new MemoryFile(filename, "sdfsdfds");
    const reg = new Registry().addFile(file).parse();
    const found = new Highlight(reg).listDefinitionPositions({uri: filename});
    expect(found.length).to.equal(0);
  });

  it("Single definition", () => {
    const file = new MemoryFile(filename, "DATA bar TYPE i.");
    const reg = new Registry().addFile(file).parse();
    const found = new Highlight(reg).listDefinitionPositions({uri: filename});
    expect(found.length).to.equal(1);
  });

  it("Single read", () => {
    const file = new MemoryFile(filename, "DATA bar TYPE i.\nWRITE bar.\n");
    const reg = new Registry().addFile(file).parse();
    const found = new Highlight(reg).listReadPositions({uri: filename});
    expect(found.length).to.equal(1);
  });

  it("Single write", () => {
    const file = new MemoryFile(filename, "DATA bar TYPE i.\nbar = 2.\n");
    const reg = new Registry().addFile(file).parse();
    const found = new Highlight(reg).listWritePositions({uri: filename});
    expect(found.length).to.equal(1);
  });

});