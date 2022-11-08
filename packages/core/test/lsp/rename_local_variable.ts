import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Rename} from "../../src/lsp/rename";
import * as LServer from "vscode-languageserver-types";
import {MemoryFile} from "../../src/files/memory_file";
import {ApplyWorkSpaceEdit} from "./_apply_edit";

describe("LSP, prepare rename, local variable", () => {

  it("bad position", async () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE 'hello'.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const rename = new Rename(reg);

    const result = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(0, 1)});
    expect(result).to.equal(undefined);
  });

  it("DATA", async () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA foobar TYPE i.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const rename = new Rename(reg);

    const result = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(0, 8)});

    expect(result).to.not.equal(undefined);
    expect(result?.placeholder).to.equal("foobar");
  });

  it("simple", async () => {
    const abap = `DATA foo TYPE i.
WRITE foo.`;
    const file = new MemoryFile("foobar.prog.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();

    const result = new Rename(reg).rename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(0, 7),
      newName: "bar"});
    expect(result).to.not.equal(undefined);
    new ApplyWorkSpaceEdit(reg).apply(result!);
    await reg.parseAsync();

    const expected = `DATA bar TYPE i.
WRITE bar.`;
    expect(reg.getFirstObject()?.getFiles()[0]?.getRaw()).to.equal(expected);
  });

});