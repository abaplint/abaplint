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

});