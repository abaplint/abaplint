import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {InlayHints} from "../../src/lsp/inlay_hints";

const filename: string = "inlayhints.prog.abap";

describe("LSP, Inlay Hints", () => {

  it("parser error", () => {
    const file = new MemoryFile(filename, "sdfsdfds");
    const reg = new Registry().addFile(file).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(0);
  });

  it("NEW", () => {
    const file = new MemoryFile(filename, `
CLASS lcl DEFINITION.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.
START-OF-SELECTION.
  DATA ref TYPE REF TO lcl.
  ref = NEW #( ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(1);
  });

  it("CONV", () => {
    const file = new MemoryFile(filename, `
  DATA val TYPE i.
  val = CONV #( '1' ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(1);
  });

});