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
    position: LServer.Position.create(row, column),
  };
}

describe("LSP, references", () => {

  it("simple", async () => {
    const file = new MemoryFile("foobar.prog.abap", `DATA foobar TYPE c.
WRITE foobar.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 0, 7));
    expect(found.length).to.equal(2);
  });

  it("also possible to find all references from the usage", async () => {
    const file = new MemoryFile("foobar.prog.abap", `DATA foobar TYPE c.
WRITE foobar.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 1, 7));
    expect(found.length).to.equal(2);
  });

  it("multiple definitions", async () => {
    const file = new MemoryFile("foobar.prog.abap", `DATA foobar TYPE c.
DATA loo TYPE c.
WRITE foobar.
WRITE loo.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 0, 7));
    expect(found.length).to.equal(2);
  });

  it("for built-in", async () => {
    const file = new MemoryFile("foobar.prog.abap", `WRITE abap_true.
WRITE abap_false.
WRITE abap_true.
WRITE abap_false.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 0, 7));
    expect(found.length).to.equal(2);
  });

  it.skip("method references", async () => {
    const file = new MemoryFile("foobar.prog.abap", `CLASS lcl_bar DEFINITION.
    PUBLIC SECTION.
      METHODS: foobar IMPORTING int TYPE i.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
    METHOD foobar.
    ENDMETHOD.
  ENDCLASS.
  START-OF-SELECTION.
    NEW lcl_bar( )->foobar( 1 ).`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 2, 18));
    expect(found.length).to.equal(1);
  });

  it("class references", async () => {
    const file = new MemoryFile("foobar.prog.abap", `CLASS lcl_bar DEFINITION.
  ENDCLASS.
  CLASS lcl_bar IMPLEMENTATION.
  ENDCLASS.
  DATA foo TYPE REF TO lcl_bar.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 0, 10));
    expect(found.length).to.equal(1);
  });

  it("interface references", async () => {
    const file = new MemoryFile("foobar.prog.abap", `INTERFACE lif_bar.
  ENDINTERFACE.
  DATA foo TYPE REF TO lif_bar.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 0, 14));
    expect(found.length).to.equal(1);
  });

  it("find references for type", async () => {
    const file = new MemoryFile("foobar.prog.abap", `TYPES ty_type TYPE c LENGTH 6.
    DATA foo TYPE ty_type.`);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const found = new References(reg).references(buildPosition(file, 0, 7));
    expect(found.length).to.equal(1);
  });

});