import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Implementation} from "../../src/lsp/implementation";

describe("LSP, implementation", () => {

  it("not found", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE |foobar|.");
    const reg = new Registry().addFile(file).parse();
    const def = new Implementation(reg).find({uri: file.getFilename()}, LServer.Position.create(0, 7));
    expect(def.length).to.equal(0);
  });

  it("PROG, goto INCLUDE", () => {
    const prog1 = new MemoryFile("zprog1.prog.abap", `
      DATA moo TYPE string.
      INCLUDE zprog2.`);
    const prog2 = new MemoryFile("zprog2.prog.abap", `
      WRITE moo.
      WRITE boo.`);

    const reg = new Registry().addFile(prog1).addFile(prog2).parse();
    const def = new Implementation(reg).find({uri: prog1.getFilename()}, LServer.Position.create(2, 16));

    expect(def.length).to.equal(1);
    expect(def[0].uri).to.equal(prog2.getFilename());
  });

});