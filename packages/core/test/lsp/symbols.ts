import {expect} from "chai";
import {Registry} from "../../src/registry";
import {Symbols} from "../../src/lsp/symbols";
import {MemoryFile} from "../../src/files/memory_file";

describe("LSP, symbols", () => {

  it("Simple WRITE, no symbols", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "WRITE foo.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const symbols = new Symbols(reg).find(file.getFilename());
    expect(symbols.length).to.equal(0);
  });

  it("Class Definition", async () => {
    const abap = "REPORT zfoobar.\n" +
      "CLASS lcl_foobar DEFINITION.\n" +
      "ENDCLASS.\n" +
      "CLASS lcl_foobar IMPLEMENTATION.\n" +
      "ENDCLASS.\n";
    const file = new MemoryFile("zfoobar.prog.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const issues = reg.findIssues();
    expect(issues.length).to.equal(0);
    const symbols = new Symbols(reg).find(file.getFilename());
    expect(symbols.length).to.equal(2);
    expect(symbols[0].name).to.equal("lcl_foobar");
  });

  it("Class Implementation", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "CLASS lcl_foobar IMPLEMENTATION.\nENDCLASS.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const symbols = new Symbols(reg).find(file.getFilename());
    expect(symbols.length).to.equal(1);
    expect(symbols[0].name).to.equal("lcl_foobar");
  });

  it("Class Implementation, with method", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "CLASS lcl_foobar IMPLEMENTATION.\nMETHOD foo.\nENDMETHOD.\nENDCLASS.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    const symbols = new Symbols(reg).find(file.getFilename());
    expect(symbols.length).to.equal(1);
    expect(symbols[0].name).to.equal("lcl_foobar");
    expect(symbols[0].children).to.not.equal(undefined);
    expect(symbols[0].children!.length).to.equal(1);
    expect(symbols[0].children![0].name).to.equal("foo");
  });

  it("FORM Definition", async () => {
    const file = new MemoryFile("zfoobar.prog.abap", "REPORT zfoobar.\nFORM foobar.\n  WRITE 'test'.\nENDFORM.");
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg.findIssues().length).to.equal(0);
    const symbols = new Symbols(reg).find(file.getFilename());
    expect(symbols.length).to.equal(1);
    expect(symbols[0].name).to.equal("foobar");
  });

});