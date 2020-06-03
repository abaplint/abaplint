import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {IFile} from "../../src/files/_ifile";
import {ITextDocumentPositionParams} from "../../src/lsp/_interfaces";
import {References} from "../../src/lsp/references";

function buildPosition(file: IFile, row: number, column: number): ITextDocumentPositionParams {
  return {
    textDocument: {uri: file.getFilename()},
    position: LServer.Position.create(row , column),
  };
}

describe("LSP, references", () => {

  it("simple", () => {
    const file = new MemoryFile("foobar.prog.abap", `DATA foobar TYPE c.
WRITE foobar.`);
    const reg = new Registry().addFile(file).parse();
    const found = new References(reg).references(buildPosition(file, 0 , 7));
    expect(found.length).to.equal(2);
  });

  it("also possible to find all references from the usage", () => {
    const file = new MemoryFile("foobar.prog.abap", `DATA foobar TYPE c.
WRITE foobar.`);
    const reg = new Registry().addFile(file).parse();
    const found = new References(reg).references(buildPosition(file, 1 , 7));
    expect(found.length).to.equal(2);
  });

  it("multiple definitions", () => {
    const file = new MemoryFile("foobar.prog.abap", `DATA foobar TYPE c.
DATA loo TYPE c.
WRITE foobar.
WRITE loo.`);
    const reg = new Registry().addFile(file).parse();
    const found = new References(reg).references(buildPosition(file, 0 , 7));
    expect(found.length).to.equal(2);
  });

  it("for built-in", () => {
    const file = new MemoryFile("foobar.prog.abap", `WRITE abap_true.
WRITE abap_false.
WRITE abap_true.
WRITE abap_false.`);
    const reg = new Registry().addFile(file).parse();
    const found = new References(reg).references(buildPosition(file, 0 , 7));
    expect(found.length).to.equal(2);
  });

});