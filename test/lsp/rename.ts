import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Rename} from "../../src/lsp/rename";
import * as LServer from "vscode-languageserver-types";

describe("LSP, rename", () => {

  it("prepare rename, bad position", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file).parse();
    const rename = new Rename(reg);

    const result = rename.prepareRename({textDocument: {uri: file.getFilename()}, position: LServer.Position.create(1, 1)});
    expect(result).to.equal(undefined);
  });

  it("prepare rename, bad position", () => {
    const file = new MemoryFile(
      "zcl_foobar.clas.abap",
      `CLASS zcl_foobar DEFINITION PUBLIC CREATE PUBLIC.
      ENDCLASS.
      CLASS zcl_foobar IMPLEMENTATION.
      ENDCLASS.`);
    const reg = new Registry().addFile(file).parse();

    const rename = new Rename(reg);

    const result = rename.prepareRename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(0, 10)});

    expect(result).to.not.equal(undefined);
    expect(result!.placeholder).to.equal("zcl_foobar");
  });

});