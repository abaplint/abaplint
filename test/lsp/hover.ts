import {expect} from "chai";
import {MemoryFile} from "../../src/files";
import {Registry} from "../../src/registry";
import {Hover} from "../../src/lsp/hover";
import {MarkupContent} from "vscode-languageserver-types";

describe("LSP, hover", () => {

  it("first character = DO", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO.");
    const reg = new Registry().addFile(file).parse();

    let hover: MarkupContent | undefined = undefined;
    for (let i = 0; i < 2; i++) {
      hover = Hover.find(reg, file.getFilename(), 0 , i);
      expect(hover).to.not.equal(undefined);
      expect(hover!.value).to.contain("```abap\nDO\n```\nStatement: Do\n\nToken: Identifier");
    }

    hover = Hover.find(reg, file.getFilename(), 0 , 2);
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("```abap\n.\n```\nStatement: Do\n\nToken: Punctuation");

    hover = Hover.find(reg, file.getFilename(), 1 , 0);
    expect(hover).to.equal(undefined);

    hover = Hover.find(reg, file.getFilename(), 0 , 3);
    expect(hover).to.equal(undefined);
  });

  it("full structure", () => {
    const file = new MemoryFile("foobar.prog.abap", "DO. ENDDO.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, file.getFilename(), 0 , 0);
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Structure: Any");
  });

  it("full structure, 2nd token", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE hello.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, file.getFilename(), 0 , 7);
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("hello");
    expect(hover!.value).to.contain("Structure: Any");
  });

});