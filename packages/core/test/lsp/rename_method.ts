import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Rename} from "../../src/lsp/rename";
import * as LServer from "vscode-languageserver-types";
import {MemoryFile} from "../../src/files/memory_file";
import {ApplyWorkSpaceEdit} from "./_apply_edit";

describe("LSP, rename method", () => {

  it("rename method", async () => {
    const abap = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS foo.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;
    const file = new MemoryFile("foobar.prog.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();

    const result = new Rename(reg).rename({
      textDocument: {uri: file.getFilename()},
      position: LServer.Position.create(2, 20),
      newName: "renamed"});
    expect(result).to.not.equal(undefined);
    new ApplyWorkSpaceEdit(reg).apply(result!);
    await reg.parseAsync();

    const expected = `CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS renamed.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD renamed.
  ENDMETHOD.
ENDCLASS.`;
    expect(reg.getFirstObject()?.getFiles()[0]?.getRaw()).to.equal(expected);
  });

});