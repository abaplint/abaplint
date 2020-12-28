import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {LanguageServer} from "../../src";

describe("LSP, formatting", () => {

  it("format", () => {
    const name = "zfoobar.prog.abap";
    const file = new MemoryFile(name, "break-point.");
    const registry = new Registry().addFile(file).parse();

    const edits = new LanguageServer(registry).documentFormatting({
      textDocument: {uri: name},
    });

    expect(edits).to.not.equal(undefined);
  });

});