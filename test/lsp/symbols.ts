import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Symbols} from "../../src/lsp/symbols";

describe("LSP, symbols", () => {

  it("Simple WRITE", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foo.");
    const reg = new Registry().addFile(file).parse();
    const symbols = Symbols.find(reg, file.getFilename());
    expect(symbols.length).to.equal(0);
  });

  it("Class Definition", () => {
    const file = new MemoryFile("foobar.prog.abap", "CLASS lcl_foobar DEFINITION.\nENDCLASS.");
    const reg = new Registry().addFile(file).parse();
    expect(reg.findIssues().length).to.equal(0);
    const symbols = Symbols.find(reg, file.getFilename());
    expect(symbols.length).to.equal(1);
    expect(symbols[0].name).to.equal("lcl_foobar");
  });

});