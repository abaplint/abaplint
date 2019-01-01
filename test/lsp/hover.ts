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

  it("two tokens with same string", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover1 = Hover.find(reg, file.getFilename(), 0 , 7);
    const hover2 = Hover.find(reg, file.getFilename(), 1 , 7);
    expect(hover1).to.not.equal(undefined);
    expect(hover2).to.not.equal(undefined);
    expect(hover1!.value).to.contain("InlineData");
    expect(hover2!.value).to.not.contain("InlineData");
  });

  it("not resolved", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, file.getFilename(), 0 , 7);
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Not resolved");
  });

  it("resolved, local", () => {
    const file = new MemoryFile("foobar.prog.abap", "DATA(foobar) = 2.\nWRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, file.getFilename(), 1 , 7);
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Resolved: Local");
  });

  it("Is keyword", () => {
    const file = new MemoryFile("foobar.prog.abap", "WRITE foobar.");
    const reg = new Registry().addFile(file).parse();
    const hover = Hover.find(reg, file.getFilename(), 0 , 2);
    expect(hover).to.not.equal(undefined);
    expect(hover!.value).to.contain("Is a ABAP keyword");
  });

});