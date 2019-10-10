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
    expect(hover!.value).to.contain("Not resolved");
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, {uri: file.getFilename()}, LServer.Position.create(1 , 7));
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved");
  });

});