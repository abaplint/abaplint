import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Definition} from "../../src/lsp/definition";

describe("LSP, definition", () => {

  it("not found", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const def = new Definition(reg).find({uri: file.getFilename()}, LServer.Position.create(0, 7));
    expect(def).to.equal(undefined);
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const def = new Definition(reg).find({uri: file.getFilename()}, LServer.Position.create(1, 7));
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
    const def = new Definition(reg).find({uri: fileClas.getFilename()}, LServer.Position.create(8, 20));
    expect(def).to.not.equal(undefined);
    expect(def!.uri).to.equal(fileIntf.getFilename());
    expect(def!.range.start.line).to.equal(2);
  });

  it("PROG, goto INCLUDE", () => {
    const prog1 = new MemoryFile("zprog1.prog.abap", `
      DATA moo TYPE string.
      INCLUDE zprog2.`);
    const prog2 = new MemoryFile("zprog2.prog.abap", `
      WRITE moo.
      WRITE boo.`);

    const reg = new Registry().addFile(prog1).addFile(prog2).parse();
    const def = new Definition(reg).find({uri: prog1.getFilename()}, LServer.Position.create(2, 16));

    expect(def).to.not.equal(undefined);
    expect(def!.uri).to.equal(prog2.getFilename());
  });

  it("PROG, goto FORM from PERFORM", () => {
    const prog1 = new MemoryFile("zprog1.prog.abap", `
      FORM foo.
      ENDFORM.
      START-OF-SELECTION.
        PERFORM foo.`);

    const reg = new Registry().addFile(prog1).parse();
    const def = new Definition(reg).find({uri: prog1.getFilename()}, LServer.Position.create(4, 18));

    expect(def).to.not.equal(undefined);
    expect(def!.uri).to.equal(prog1.getFilename());
  });

  it("resolved, built-in, expect no location", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE sy-sysid.");
    const reg = new Registry().addFile(file).parse();
    const def = new Definition(reg).find({uri: file.getFilename()}, LServer.Position.create(0, 7));
    expect(def).to.equal(undefined);
  });

// todo
// INHERITING FROM zcl_jump_here
// INTERFACES zif_jump_here

});