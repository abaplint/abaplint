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
    position: LServer.Position.create(row, column),
  };
}

describe("LSP, hover", () => {

  it("not resolved", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 7));
    expect(hover).to.equal(undefined);
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("resolved, local type", () => {
    const file = new MemoryFile("foobar.prog.abap", "TYPES foobar TYPE i.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("resolved, typed", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA foobar TYPE string.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("String", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE 'hello'.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("String");
  });

  it("Comment", () => {
    const file = new MemoryFile("foobar.prog.abap", "* foo bar moo loo hoo");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Comment");
  });

  it("String Template", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE |bar|.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 9));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("String Template");
  });

  it("keyword", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 3));
    expect(hover).to.equal(undefined);
  });

  it.skip("keyworld should not resolve", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA write TYPE i.\nWRITE write.");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 1, 3));
    expect(hover).to.equal(undefined);
  });

  it.skip("hover method parameter", async () => {
    const abap = `CLASS lcl_abapgit_zlib_stream DEFINITION.
  PUBLIC SECTION.
    METHODS take_int
      IMPORTING
        !iv_length TYPE i.
ENDCLASS.

CLASS lcl_abapgit_zlib_stream IMPLEMENTATION.
  METHOD take_int.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("foobar.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 4, 12));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("builtin method", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(bar) = condense( |sdfsdfsd| ).");
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 0, 16));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("Builtin");
  });

  it("hover class reference", () => {
    const abap = `CLASS lcl_password_dialog DEFINITION.
  PUBLIC SECTION.
    CONSTANTS c_dynnr TYPE c LENGTH 1 VALUE '1'.
ENDCLASS.
CLASS lcl_password_dialog IMPLEMENTATION.
ENDCLASS.
WRITE lcl_password_dialog=>c_dynnr.`;
    const file = new MemoryFile("foobar.prog.abap", abap);
    const reg = new Registry().addFile(file).parse();
    const hover = new Hover(reg).find(buildPosition(file, 6, 10));
    expect(hover).to.not.equal(undefined);
    expect(hover?.value).to.contain("lcl_password_dialog");
  });

});