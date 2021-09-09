import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {SemanticHighlighting} from "../../src/lsp/semantic";

const filename: string = "foobar.prog.abap";

describe("LSP, semantic highlighting", () => {

  it("basic", () => {
    const file = new MemoryFile(filename, "WRITE 'hello'.");
    const reg = new Registry().addFile(file).parse();
    const tokenInformation = new SemanticHighlighting(reg).semanticTokensRange(
      {textDocument: {uri: filename}, start: {line: 0, character: 0}, end: {line: 0, character: 15}});
    expect(tokenInformation.data).to.eql([0, 0, 5, 15, 0, 0, 6, 7, 18, 0, 0, 7, 1, 13, 0]);
  });

});