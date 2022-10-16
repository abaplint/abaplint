import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Rename} from "../../src/lsp/rename";
import * as LServer from "vscode-languageserver-types";
import {MemoryFile} from "../../src/files/memory_file";

describe("LSP, prepare rename, local variable", () => {

  it("bad position", async () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE 'hello'.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const rename = new Rename(reg);

    const result = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(1, 1)});
    expect(result).to.equal(undefined);
  });

  it("DATA", async () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA foobar TYPE i.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const rename = new Rename(reg);

    const result = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(1, 8)});
// todo,
    expect(result).to.equal(undefined);
  });

});