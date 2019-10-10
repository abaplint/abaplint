import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Help} from "../../src/lsp/help";
import * as LServer from "vscode-languageserver-types";

describe("LSP, help", () => {

  it("first character = DO", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file).parse();

    let hover = "";
    for (let i = 0; i < 2; i++) {
      hover = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , i));
      expect(hover).to.contain("Statement: Do");
      expect(hover).to.contain("Token: Identifier");
    }

    hover = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 2));
    expect(hover).to.contain("Statement: Do");
    expect(hover).to.contain("Token: Punctuation");
  });

  it("full structure", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO. ENDDO.");
    const reg = new Registry().addFile(file).parse();
    const hover = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 0));
    expect(hover).to.contain("Structure: Any");
  });

  it("full structure, 2nd token", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE hello.");
    const reg = new Registry().addFile(file).parse();
    const hover = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 7));
    expect(hover).to.contain("hello");
    expect(hover).to.contain("Structure: Any");
  });

});