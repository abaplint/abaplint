import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Help} from "../../src/lsp/help";
import * as LServer from "vscode-languageserver-types";
import {MemoryFile} from "../../src/files/memory_file";

describe("LSP, help", () => {

  it("first character = DO", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file).parse();

    let help = "";
    for (let i = 0; i < 2; i++) {
      help = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0, i));
      expect(help).to.contain("Statement: <a href=\"https://syntax.abaplint.org/#/statement/Do\" target=\"_blank\">Do</a>");
      expect(help).to.contain("Token: Identifier");
    }

    help = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0, 2));
    expect(help).to.contain("Statement: <a href=\"https://syntax.abaplint.org/#/statement/Do\" target=\"_blank\">Do</a>");
    expect(help).to.contain("Token: Punctuation");
  });

  it("class", () => {
    const abap = `
CLASS zcl_abapgit_object_pinf DEFINITION.
ENDCLASS.
CLASS zcl_abapgit_object_pinf IMPLEMENTATION.
ENDCLASS.
    `;
    const file = new MemoryFile("zcl_foobar.clas.abap", abap);
    const reg = new Registry().addFile(file).parse();

    const help = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0, 2));
    expect(help).to.not.equal(undefined);
  });

});