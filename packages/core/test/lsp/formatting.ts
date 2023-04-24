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

  it("update and format", () => {
    const name = "zfoobar.prog.abap";
    const file = new MemoryFile(name, "DATA before TYPE i.");
    const registry = new Registry().addFile(file).parse();
    registry.updateFile(new MemoryFile(name, "data after TYPE i."));

    const edits = new LanguageServer(registry).documentFormatting({
      textDocument: {uri: name},
    });

    expect(edits).to.not.equal(undefined);
    expect(edits[0].newText).to.include("after");
  });

  it("no update, all good", () => {
    const name = "zfoobar.prog.abap";
    const file = new MemoryFile(name, "DATA before TYPE i.");
    const registry = new Registry().addFile(file).parse();

    const edits = new LanguageServer(registry).documentFormatting({
      textDocument: {uri: name},
    });

    expect(edits.length).to.equal(0);
  });

  it("dont mess with empty lines", () => {
// note: empty line at end of file should be handled by editorconfig or similar
    const name = "zfoobar.prog.abap";
    const file = new MemoryFile(name, "hello\n\n");
    const registry = new Registry().addFile(file).parse();

    const edits = new LanguageServer(registry).documentFormatting({
      textDocument: {uri: name},
    });

    expect(edits.length).to.equal(0);
  });

});