import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Highlight} from "../../src/lsp/highlight";

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

});