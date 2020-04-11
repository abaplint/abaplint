import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Diagnostics} from "../../src/lsp/diagnostics";

describe("LSP, diagnostics", () => {

  it("find issues for file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().addFile(file).parse();
    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(2);
  });

  it("find issues for unknown file", () => {
    const file = new MemoryFile("zfoobar.prog.abap", "BREAK-POINT.");
    const registry = new Registry().parse();
    expect(new Diagnostics(registry).find({uri: file.getFilename()}).length).to.equal(0);
  });

});