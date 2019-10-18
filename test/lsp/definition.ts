import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Definition} from "../../src/lsp/definition";

describe("LSP, definition", () => {

  it("not found", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const def = Definition.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 7));
    expect(def).to.equal(undefined);
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const def = Definition.find(reg, {uri: file.getFilename()}, LServer.Position.create(1 , 7));
    expect(def).to.not.equal(undefined);
    expect(def!.range.start.line).to.equal(0);
  });

  it("resolved, cross files", () => {
    const fileIntf = new MemoryFile("zif_test.intf.abap", `
      INTERFACE zif_test PUBLIC.
        DATA moo TYPE string.
      ENDINTERFACE.`);
    const fileClas = new MemoryFile("zcl_test.clas.abap", `
      CLASS zcl_test DEFINITION PUBLIC FINAL CREATE PUBLIC.
        PUBLIC SECTION.
          INTERFACES zif_test.
          METHODS method1.
      ENDCLASS.
      CLASS ZCL_TEST IMPLEMENTATION.
        METHOD method1.
          WRITE: / zif_test~moo.
        ENDMETHOD.
      ENDCLASS.`);
    const reg = new Registry().addFile(fileIntf).addFile(fileClas).parse();
    const def = Definition.find(reg, {uri: fileClas.getFilename()}, LServer.Position.create(8 , 20));
    expect(def).to.not.equal(undefined);
    expect(def!.uri).to.equal(fileIntf.getFilename());
    expect(def!.range.start.line).to.equal(2);
  });

});