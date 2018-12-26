import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Hover} from "../../src/lsp/hover";

describe("LSP, hover", () => {

  it("first character = DO", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file).parse();

    let hover = Hover.find(reg, file.getFilename(), 0 , 0);
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.equal("DO\nStatementNode\nIdentifier");

    hover = Hover.find(reg, file.getFilename(), 1 , 0);
    expect(hover).to.equal(undefined);

    hover = Hover.find(reg, file.getFilename(), 0 , 4);
    expect(hover).to.equal(undefined);
  });

});