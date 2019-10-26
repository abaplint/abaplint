import * as LServer from "vscode-languageserver-types";
import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Hover} from "../../src/lsp/hover";

describe("LSP, hover", () => {

  it("not resolved", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Unknown");
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, {uri: file.getFilename()}, LServer.Position.create(1 , 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

  it("resolved, typed", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA foobar TYPE string.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, {uri: file.getFilename()}, LServer.Position.create(1 , 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved, Typed");
  });

  it("String", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE 'hello'.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("String");
  });

  it("Comment", () => {
    const file = new MemoryFile("foobar.prog.abap", "* foo bar moo loo hoo");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 10));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Comment");
  });

});