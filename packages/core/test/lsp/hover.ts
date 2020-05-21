import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Hover} from "../../src/lsp/hover";
import {IFile} from "../../src/files/_ifile";
import {ITextDocumentPositionParams} from "../../src/lsp/_interfaces";

function buildPosition(file: IFile, row: number, column: number): ITextDocumentPositionParams {
  return {
    textDocument: {uri: file.getFilename()},
    position: LServer.Position.create(row , column),
  };
}

describe("LSP, hover", () => {

  it("not resolved", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, buildPosition(file, 0 , 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Unknown");
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, buildPosition(file, 1 , 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("resolved, typed", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA foobar TYPE string.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, buildPosition(file, 1 , 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved, Typed");
  });

  it("String", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE 'hello'.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, buildPosition(file, 0 , 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("String");
  });

  it("Comment", () => {
    const file = new MemoryFile("foobar.prog.abap", "* foo bar moo loo hoo");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, buildPosition(file, 0 , 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Comment");
  });

  it("String Template", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE |bar|.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, buildPosition(file, 0 , 9));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("String Template");
  });

  it.skip("keyword", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, buildPosition(file, 0 , 3));
    expect(hover).to.equal(undefined);
  });

});