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
      expect(hover).to.contain("Statement: <a href=\"https://syntax.abaplint.org/#/statement/Do\" target=\"_blank\">Do</a>");
      expect(hover).to.contain("Token: Identifier");
    }

    hover = Help.find(reg, {uri: file.getFilename()}, LServer.Position.create(0 , 2));
    expect(hover).to.contain("Statement: <a href=\"https://syntax.abaplint.org/#/statement/Do\" target=\"_blank\">Do</a>");
    expect(hover).to.contain("Token: Punctuation");
  });

});