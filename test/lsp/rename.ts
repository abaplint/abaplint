import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Rename} from "../../src/lsp/rename";
import * as LServer from "vscode-languageserver-types";

describe("LSP, rename", () => {

  it("prepare rename, bad position", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file).parse();
    const rename = new Rename(reg);

    const result = rename.prepareRename({textDocument: {uri: file.getFilename()}, position: LServer.Position.create(1, 1)});
    expect(result).to.equal(undefined);
  });

});